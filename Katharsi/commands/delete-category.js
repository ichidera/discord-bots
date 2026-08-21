// Katharsi/commands/delete-category.js
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
    .setName('delete-category')
    .setDescription('Permanently delete a category — with or without the channels inside it.')
    .addChannelOption((opt) =>
      opt
        .setName('category')
        .setDescription('The category to delete')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setDescription('What happens to the channels inside it')
        .setRequired(true)
        .addChoices(
          { name: 'Delete the category AND every channel inside it', value: 'with-channels' },
          { name: 'Delete only the category (channels stay, become uncategorized)', value: 'without-channels' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', flags: MessageFlags.Ephemeral });
    }

    const category = interaction.options.getChannel('category');
    const mode = interaction.options.getString('mode');
    const children = interaction.guild.channels.cache.filter((c) => c.parentId === category.id);
    const willDeleteSelfChannel = mode === 'with-channels' && children.has(interaction.channelId);

    const warnText =
      mode === 'with-channels'
        ? `⚠️ This permanently deletes **${category.name}** AND its ${children.size} channel(s) inside it. A backup will be saved first. Confirm within 15s.`
        : `⚠️ This permanently deletes **${category.name}** only. Its ${children.size} channel(s) stay, uncategorized. A backup will be saved first. Confirm within 15s.`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('delcat_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('delcat_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ content: warnText, components: [row], flags: MessageFlags.Ephemeral });

    let button;
    try {
      button = await interaction.channel.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && ['delcat_confirm', 'delcat_cancel'].includes(i.customId),
        time: 15000,
      });
    } catch {
      return interaction.editReply({ content: '⌛ Timed out. Nothing was deleted.', components: [] });
    }

    if (button.customId === 'delcat_cancel') {
      return button.update({ content: '🚫 Cancelled. Nothing was touched.', components: [] });
    }

    await button.update({ content: '💾 Backing up, then deleting…', components: [] });

    createBackup(interaction.guild);

    let deleted = 0;
    let failed = 0;

    if (mode === 'with-channels') {
      for (const ch of children.values()) {
        try {
          await ch.delete(`Category cascade delete by ${interaction.user.tag}`);
          deleted++;
        } catch (err) {
          console.error(err);
          failed++;
        }
      }
    }

    try {
      await category.delete(`Deleted by ${interaction.user.tag}`);
      deleted++;
    } catch (err) {
      console.error(err);
      failed++;
    }

    const summary = `✅ Done: ${deleted} deleted, ${failed} failed. Backed up beforehand — run \`/restore\` any time to bring it back.`;

    // If the channel we ran this command in got cascade-deleted, the original
    // reply is gone along with it — same 10008 issue as /nuke, so fall back
    // to a DM instead of a doomed editReply.
    if (willDeleteSelfChannel) {
      await interaction.user.send(summary).catch(() => {});
    } else {
      await interaction.editReply(summary).catch(() => {});
    }
  },
};