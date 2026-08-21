// Katharsi/commands/delete.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { createBackup } = require('../utils/backup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Permanently delete a channel — unlike /nuke, it is NOT recreated. Recoverable via /restore only.')
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Channel to delete (defaults to the one you run this in)')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildForum,
          ChannelType.GuildStageVoice
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', flags: MessageFlags.Ephemeral });
    }

    // Deleting the channel the command was run in kills the deferred reply
    // along with it (see /nuke for the same issue) — detect it up front so we
    // can fall back to a DM instead of a doomed editReply.
    const selfDelete = target.id === interaction.channelId;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Snapshot the server before this permanent delete, unconditionally —
    // even a single-channel delete becomes recoverable via /restore this way.
    createBackup(interaction.guild);

    try {
      const name = target.name;
      await target.delete(`Deleted by ${interaction.user.tag}`);
      const summary = `🗑️ Permanently deleted \`#${name}\`. A backup was taken first — recoverable with \`/restore\`.`;

      if (selfDelete) {
        await interaction.user.send(summary).catch(() => {});
      } else {
        await interaction.editReply(summary);
      }
    } catch (err) {
      console.error(err);
      const failMsg = `❌ Failed to delete that channel: ${err.message}`;
      if (selfDelete) {
        await interaction.user.send(failMsg).catch(() => {});
      } else {
        await interaction.editReply(failMsg).catch(() => {});
      }
    }
  },
};