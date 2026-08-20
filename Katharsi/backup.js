const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createBackup } = require('../utils/backup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Snapshot the current channel/category structure without deleting anything.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const backup = createBackup(interaction.guild);
    await interaction.editReply(
      `💾 Backed up ${backup.channels.length} channels/categories for **${interaction.guild.name}**. This overwrites the previous backup for this server.`
    );
  },
};
