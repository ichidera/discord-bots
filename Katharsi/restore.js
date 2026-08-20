const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { loadBackup } = require('../utils/backup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restore')
    .setDescription('Rebuild categories/channels from the last backup taken in this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const backup = loadBackup(interaction.guild.id);
    if (!backup) {
      return interaction.editReply('❌ No backup found for this server. Run `/backup` or `/fullnuke` first to create one.');
    }

    const guild = interaction.guild;
    const idMap = new Map(); // old channel/category id -> new channel object

    // 1. Recreate categories first
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
        console.error(`Failed to restore category ${cat.name}:`, err.message);
      }
    }

    // 2. Recreate everything else, attached to the new parent category if it had one
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
        console.error(`Failed to restore channel ${ch.name}:`, err.message);
        failed++;
      }
    }

    await interaction.editReply(
      `✅ Restore complete: ${categoryEntries.length} categories, ${restored} channels rebuilt (${failed} failed). ` +
        `Note: messages, threads, and pins can't be restored — Discord's API doesn't expose deleted message history.`
    );
  },
};
