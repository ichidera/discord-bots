const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createBackup } = require('../utils/backup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fullnuke')
    .setDescription('Delete every channel and category in this server (server itself is untouched). Backs up first.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', flags: MessageFlags.Ephemeral });
    }

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('fullnuke_confirm').setLabel('Yes, nuke everything').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('fullnuke_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: `⚠️ This will delete **every channel and category** in **${interaction.guild.name}**. A backup will be saved so you can \`/restore\` the structure (channel contents/messages can't be restored — Discord doesn't allow that via API). Confirm within 15s.`,
      components: [confirmRow],
      flags: MessageFlags.Ephemeral,
    });

    let button;
    try {
      button = await interaction.channel.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && ['fullnuke_confirm', 'fullnuke_cancel'].includes(i.customId),
        time: 15000,
      });
    } catch {
      return interaction.editReply({ content: '⌛ Timed out. Full nuke cancelled.', components: [] });
    }

    if (button.customId === 'fullnuke_cancel') {
      return button.update({ content: '🚫 Cancelled. Nothing was touched.', components: [] });
    }

    await button.update({ content: '💾 Backing up server structure…', components: [] });

    const guild = interaction.guild;
    const backup = createBackup(guild);

    // DM the invoker now, since the channel this command ran in is about to be deleted
    // and we won't be able to editReply into a channel that no longer exists.
    const dmNotice = await interaction.user
      .send(`🧨 Starting full nuke of **${guild.name}** (${backup.channels.length} channels backed up). I'll DM you when it's done.`)
      .catch(() => null);

    const channels = [...guild.channels.cache.values()];
    // Delete non-category channels first, then categories (categories can't be
    // deleted while they still "contain" channels in Discord's own UI logic,
    // though the API allows it — this order is just cleaner/safer).
    const nonCategories = channels.filter((c) => c.type !== ChannelType.GuildCategory);
    const categories = channels.filter((c) => c.type === ChannelType.GuildCategory);

    let deleted = 0;
    let failed = 0;
    for (const ch of [...nonCategories, ...categories]) {
      try {
        await ch.delete(`Full nuke by ${interaction.user.tag}`);
        deleted++;
      } catch {
        failed++;
      }
    }

    // Without this, the guild has ZERO channels and there is nowhere left to
    // type "/" at all — /restore becomes unreachable from inside the server,
    // and DMs can't run it either (a guild command has no guild context in a
    // DM, and it would be ambiguous anyway if you're admin in more than one
    // server). One landing channel keeps /restore reachable, on purpose,
    // without ever needing to route restore through DMs.
    let landing = null;
    try {
      landing = await guild.channels.create({
        name: 'start-here',
        type: ChannelType.GuildText,
        reason: 'Landing channel left after full nuke so admins have somewhere to run /restore',
      });
      await landing.send(
        `💥 **Full nuke complete.** ${deleted} deleted${failed ? `, ${failed} failed` : ''}.\n` +
          `Run \`/restore\` **right here** to rebuild the previous structure from backup, or \`/backup\` to snapshot this clean slate instead.`
      );
    } catch (err) {
      console.error('Failed to create landing channel:', err.message);
    }

    const summary =
      `✅ Full nuke complete on **${guild.name}**: ${deleted} deleted, ${failed} failed.` +
      (landing ? ` A #start-here channel was left behind — run \`/restore\` there.` : ` ⚠️ Couldn't create a landing channel — check the bot's Manage Channels permission.`);
    if (dmNotice) {
      await interaction.user.send(summary).catch(() => {});
    }
  },
};