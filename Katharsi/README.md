# Katharsi 🔥

A run-when-you-need-it Discord admin bot for your own servers. No message-by-message
clicking — everything is done through Discord's REST API in bulk.

## Commands

| Command | What it does |
|---|---|
| `/nuke [channel]` | **Instant clear.** Clones the target channel (same name, permissions, position) and deletes the original. This is the trick real "nuke" bots use — deleting messages one-by-one is rate-limited and slow; deleting+recreating the channel is a single API round trip. |
| `/fullnuke` | Backs up the *entire* server's channel/category structure to a local JSON file, then deletes every channel and category. Server itself is untouched — you keep the invite link, roles, members, and settings. Requires a button confirmation (15s timeout) so a stray keypress can't wipe your server. |
| `/backup` | Snapshots the current structure without deleting anything — handy to run before you make manual changes too. |
| `/restore` | Rebuilds categories and channels from the last backup taken in that server: names, positions, topics, NSFW flags, voice bitrate/user limits, and permission overwrites (matched back to existing roles/members). |

### The one thing it can't do
Discord's API does not expose deleted message history. `/restore` rebuilds the
**structure** (empty channels in the right place with the right permissions) — it
can't bring back message contents, threads, or pins. If you need those preserved,
export them (e.g. with a logging bot) before nuking.

## Setup

1. **Install Node.js 18+** if you don't have it.
2. Create an application at https://discord.com/developers/applications → **Bot** tab
   → Reset Token → copy it.
3. Under **OAuth2 → URL Generator**, check scopes `bot` and `applications.commands`,
   and bot permission `Administrator` (simplest — or manually grant `Manage Channels`
   + `Manage Roles` + `Send Messages` if you want to scope it down). Use the
   generated URL to invite the bot to your server(s).
4. In this folder:
   ```bash
   npm install
   cp .env.example .env
   # fill in DISCORD_TOKEN, CLIENT_ID, and (optional) GUILD_ID in .env
   npm run deploy   # registers the slash commands
   npm start        # starts the bot — stop it any time with Ctrl+C
   ```
5. Because you said you'll only run it when needed: just `npm start` before you want
   to use it and `Ctrl+C` when you're done. No server = no bot online, no cost.

## Cost check

- **Money:** $0. Discord's Bot API is free; you're running the process on your own
  machine, not paying for hosting.
- **Compute:** trivial. It's an idle WebSocket connection until you invoke a command
  — a few MB of RAM, negligible CPU. A `/fullnuke` on a ~50-channel server finishes
  in a couple seconds (bounded by Discord's rate limits, roughly 5 deletes/sec on
  channel endpoints).
- **Risk cost:** the real cost here isn't compute, it's irreversibility. `/fullnuke`
  is why the backup-then-confirm flow exists — read the confirmation prompt before
  hitting the button.

## Permissions note

Every destructive command checks that *you* (the invoker) have Administrator in that
server — not just that the bot has the permission. That's a deliberate guardrail so
this can't be triggered by a mod with lesser permissions if you ever loosen the bot's
own role.
