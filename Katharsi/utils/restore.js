// Katharsi/utils/restore.js
const { ChannelType } = require('discord.js');
const { loadBackup } = require('./backup');

/**
 * Rebuild a guild's categories/channels from its last backup.
 * Returns { ok, message } — never throws, so callers (guild command, DM
 * select-menu flow) can just await it and report the result either way.
 */
async function restoreGuildFromBackup(guild) {
  const backup = loadBackup(guild.id);
  if (!backup) {
    return {
      ok: false,
      message: `❌ No backup found for **${guild.name}**. Run \`/backup\` or \`/fullnuke\` there first to create one.`,
    };
  }

  const idMap = new Map(); // old category id -> new category channel

  const categoryEntries = backup.channels.filter((c) => c.type === ChannelType.GuildCategory);
  for (const cat of categoryEntries) {
    try {
      const overwrites = cat.permissionOverwrites
        .filter((po) => guild.roles.cache.has(po.id) || guild.members.cache.has(po.id))
        .map((po) => ({ id: po.id, type: po.type, allow: BigInt(po.allow), deny: BigInt(po.deny) }));

      const newCat = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
      });
      idMap.set(cat.id, newCat);
    } catch (err) {
      console.error(`Failed to restore category ${cat.name} in ${guild.id}:`, err.message);
    }
  }

  const otherEntries = backup.channels
    .filter((c) => c.type !== ChannelType.GuildCategory)
    .sort((a, b) => a.position - b.position);

  let restored = 0;
  let failed = 0;
  for (const ch of otherEntries) {
    try {
      const overwrites = ch.permissionOverwrites
        .filter((po) => guild.roles.cache.has(po.id) || guild.members.cache.has(po.id))
        .map((po) => ({ id: po.id, type: po.type, allow: BigInt(po.allow), deny: BigInt(po.deny) }));

      const parent = ch.parentId ? idMap.get(ch.parentId) : null;

      await guild.channels.create({
        name: ch.name,
        type: ch.type,
        parent: parent ? parent.id : undefined,
        topic: ch.topic || undefined,
        nsfw: ch.nsfw || false,
        bitrate: ch.bitrate || undefined,
        userLimit: ch.userLimit || undefined,
        permissionOverwrites: overwrites,
      });
      restored++;
    } catch (err) {
      console.error(`Failed to restore channel ${ch.name} in ${guild.id}:`, err.message);
      failed++;
    }
  }

  return {
    ok: true,
    message:
      `✅ Restore complete on **${guild.name}**: ${categoryEntries.length} categories, ${restored} channels rebuilt` +
      `${failed ? ` (${failed} failed)` : ''}. ` +
      `Note: messages, threads, and pins can't be restored — Discord's API doesn't expose deleted message history.`,
  };
}

module.exports = { restoreGuildFromBackup };