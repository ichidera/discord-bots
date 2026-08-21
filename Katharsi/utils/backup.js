// the-destroyer/utils/backup.js
const fs = require('fs');
const path = require('path');
const { ChannelType } = require('discord.js');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backups directory at ${BACKUP_DIR}`);
}

function backupPath(guildId) {
  return path.join(BACKUP_DIR, `${guildId}.json`);
}

/**
 * Snapshot every category + channel in the guild: name, type, position,
 * topic/bitrate/nsfw where relevant, and permission overwrites (by role/user ID).
 * Roles themselves are NOT touched by nuke, so we just reference role IDs.
 */
function createBackup(guild) {
  const channels = guild.channels.cache
    .map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type,
      position: ch.position,
      parentId: ch.parentId ?? null,
      topic: 'topic' in ch ? ch.topic ?? null : null,
      nsfw: 'nsfw' in ch ? !!ch.nsfw : false,
      bitrate: ch.type === ChannelType.GuildVoice ? ch.bitrate : undefined,
      userLimit: ch.type === ChannelType.GuildVoice ? ch.userLimit : undefined,
      permissionOverwrites: ch.permissionOverwrites.cache.map((po) => ({
        id: po.id,
        type: po.type,
        allow: po.allow.bitfield.toString(),
        deny: po.deny.bitfield.toString(),
      })),
    }))
    // Categories first, then everything else, roughly preserving hierarchy order
    .sort((a, b) => {
      if (a.type === ChannelType.GuildCategory && b.type !== ChannelType.GuildCategory) return -1;
      if (b.type === ChannelType.GuildCategory && a.type !== ChannelType.GuildCategory) return 1;
      return a.position - b.position;
    });

  const snapshot = {
    guildId: guild.id,
    guildName: guild.name,
    takenAt: new Date().toISOString(),
    channels,
  };

  fs.writeFileSync(backupPath(guild.id), JSON.stringify(snapshot, null, 2));
  return snapshot;
}

function loadBackup(guildId) {
  const file = backupPath(guildId);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

module.exports = { createBackup, loadBackup, backupPath };