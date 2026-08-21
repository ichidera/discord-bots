// Katharsi/deploy-commands.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const guildCommands = [];
const globalCommands = [];

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.global) {
    globalCommands.push(command.data.toJSON());
  } else {
    guildCommands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    // Guild-scoped commands (nuke, fullnuke, delete, delete-category, backup):
    // deliberately kept guild-only. These are destructive and only make sense
    // run from inside the server they act on — no DM ambiguity to worry about.
    if (guildCommands.length) {
      const route = process.env.GUILD_ID
        ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
        : Routes.applicationCommands(process.env.CLIENT_ID);
      const scope = process.env.GUILD_ID ? `guild ${process.env.GUILD_ID}` : 'globally';
      console.log(`Registering ${guildCommands.length} guild commands ${scope}...`);
      await rest.put(route, { body: guildCommands });
    }

    // Global commands (restore): registered globally regardless of GUILD_ID,
    // since it needs to work in DMs too, which requires a global command with
    // BotDM in its contexts. Global registration can take up to ~1 hour to
    // fully propagate the first time (guild commands above are instant).
    if (globalCommands.length) {
      console.log(`Registering ${globalCommands.length} global command(s) (may take up to 1hr to propagate)...`);
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: globalCommands });
    }

    console.log('✅ Commands registered.');
  } catch (err) {
    console.error(err);
  }
})();