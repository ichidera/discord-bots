// Katharsi/commands/restore.js
const fs = require('fs');
const path = require('path');
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require('discord.js');
const { restoreGuildFromBackup } = require('../utils/restore');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

module.exports = {
  // Registered as a GLOBAL command (see deploy-commands.js), not a guild
  // command like the others — that's what lets it be invoked from a DM with
  // the bot, not just from inside a server.
  global: true,

  data: new SlashCommandBuilder()
    .setName('restore')
    .setDescription("Rebuild a server's channel/category structure from its last backup.")
    // GuildInstall: this command stays tied to servers you've added the bot
    // to (not a personal user-install). Contexts adds BotDM on top of the
    // normal Guild context, so it also works in your DM with the bot.
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // --- Run inside a server: restore that server directly, same as before ---
    if (interaction.inGuild()) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ You need Administrator to do that.', flags: MessageFlags.Ephemeral });
      }
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const result = await restoreGuildFromBackup(interaction.guild);
      return interaction.editReply(result.message);
    }

    // --- Run in a DM: figure out WHICH server, since the bot could be in several ---
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!fs.existsSync(BACKUP_DIR)) {
      return interaction.editReply('❌ No backups exist yet anywhere. Run `/backup` or `/fullnuke` in a server first.');
    }

    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));
    const eligible = [];

    for (const file of files) {
      const guildId = file.replace(/\.json$/, '');
      const guild = interaction.client.guilds.cache.get(guildId);
      if (!guild) continue; // bot isn't (or no longer is) in that server

      // Only offer servers where YOU currently have Administrator — this is
      // the actual fix for the ambiguity: instead of guessing, we list only
      // servers you're both in and an admin of, and you pick explicitly.
      const member = await guild.members.fetch(interaction.user.id).catch(() => null);
      if (!member || !member.permissions.has(PermissionFlagsBits.Administrator)) continue;

      eligible.push(guild);
      if (eligible.length >= 25) break; // Discord select menu hard cap
    }

    if (eligible.length === 0) {
      return interaction.editReply(
        "❌ No backups found for a server where you're currently an Administrator. " +
          'Backups only exist for servers where `/backup` or `/fullnuke` has been run.'
      );
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('restore_pick_guild')
      .setPlaceholder('Choose a server to restore')
      .addOptions(
        eligible.map((g) => ({
          label: g.name.slice(0, 100),
          value: g.id,
          description: `${g.memberCount ?? '?'} members`,
        }))
      );

    const reply = await interaction.editReply({
      content: 'Which server do you want to restore?',
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    let picked;
    try {
      picked = await reply.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'restore_pick_guild',
        time: 30000,
      });
    } catch {
      return interaction.editReply({ content: '⌛ Timed out — no server selected.', components: [] });
    }

    const guildId = picked.values[0];
    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) {
      return picked.update({ content: '❌ That server is no longer available.', components: [] });
    }

    // Re-check admin status at the moment of action, not just when we built
    // the list — permissions can change in the seconds between picking and
    // confirming.
    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member || !member.permissions.has(PermissionFlagsBits.Administrator)) {
      return picked.update({ content: '❌ You no longer have Administrator in that server.', components: [] });
    }

    await picked.update({ content: `⏳ Restoring **${guild.name}**…`, components: [] });
    const result = await restoreGuildFromBackup(guild);
    await interaction.editReply(result.message);
  },
};