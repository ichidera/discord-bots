const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Instantly clear a channel (clone it, delete the old one). No message-by-message deletion.')
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Channel to nuke (defaults to the one you run this in)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator to do that.', ephemeral: true });
    }
    if (!target || !target.clone) {
      return interaction.reply({ content: '❌ That channel type can\'t be nuked this way.', ephemeral: true });
    }

    // If you're nuking the channel you ran the command in, deleting it also
    // invalidates the deferred reply Discord created inside that channel —
    // editReply() on it 404s with "Unknown Message" (code 10008) no matter
    // what we do. That's expected, not a real failure, so we skip editReply
    // in that case and rely on the confirmation posted in the new channel.
    const selfNuke = target.id === interaction.channelId;
    await interaction.deferReply({ ephemeral: true });

    try {
      const position = target.position;
      const cloned = await target.clone({ reason: `Nuked by ${interaction.user.tag}` });
      await cloned.setPosition(position).catch(() => {});
      await target.delete(`Nuked by ${interaction.user.tag}`);

      if ('send' in cloned) {
        await cloned.send('💥 **Channel nuked.** Fresh start.').catch(() => {});
      }

      if (!selfNuke) {
        await interaction.editReply(`✅ Nuked \`#${target.name}\` — recreated as ${cloned}.`);
      }
    } catch (err) {
      console.error(err);
      if (!selfNuke) {
        await interaction.editReply(`❌ Failed to nuke that channel: ${err.message}`).catch(() => {});
      }
    }
  },
};