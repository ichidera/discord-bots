# The Destroyer 🔥

A run-when-you-need-it Discord admin bot for your own servers. No message-by-message
clicking — everything is done through Discord's REST API in bulk.

## Contents
- [Commands](#commands)
- [Setup](#setup)
- [Running it (local)](#running-it-local)
- [Running it (Docker)](#running-it-docker)
- [Troubleshooting](#troubleshooting)
- [Cost check](#cost-check)
- [Permissions note](#permissions-note)

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

1. **Install Node.js 18+** if running locally (skip if you're only using Docker).
2. Create an application at https://discord.com/developers/applications → **Bot** tab
   → Reset Token → copy it. Also copy the **Application ID** from the General
   Information page — that's your `CLIENT_ID`.
3. Under **OAuth2 → URL Generator**, check **both** `bot` and `applications.commands`
   scopes (missing `applications.commands` is the #1 reason slash commands never
   appear), and bot permission `Administrator` (simplest — or manually grant
   `Manage Channels` + `Manage Roles` + `Send Messages` if you want to scope it
   down). Use the generated URL to invite the bot to your server(s).
4. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN`, `CLIENT_ID`, and
   optionally `GUILD_ID` (see [Troubleshooting](#troubleshooting) for what that
   does).

## Running it (local)

There are **two separate steps** — this trips people up, so it's worth saying
explicitly: `npm start` logs the bot in and opens its connection to Discord, but it
does **not** register your slash commands. Registration is a one-off (or
one-off-per-change) call to Discord's API, done by a *different* script.

```bash
npm install
npm run deploy   # registers /nuke /fullnuke /backup /restore with Discord — run this first
npm start        # logs the bot in — stop any time with Ctrl+C
```

You only need to re-run `npm run deploy` when you add, remove, or change a command.
`npm start` is what you run every time you just want the bot online.

## Running it (Docker)

Same two steps, just run inside (or against) the container:

```bash
# build/run your container as usual, then, one time (or after any command change):
docker exec -it katharsi node deploy-commands.js

# check it worked — you should see "✅ Commands registered."
docker logs katharsi
```

If your Dockerfile's `CMD`/`ENTRYPOINT` only runs `npm start`, the container will
show "online" in the logs (like yours did) but slash commands still won't exist
until `deploy-commands.js` has been run at least once with the same `.env` the
container uses.

## Troubleshooting

**Bot shows "online" in logs, but typing `/` shows nothing:**
Almost always means `deploy-commands.js` hasn't been run yet — see above. Run it
and check its own console output for `✅ Commands registered.` vs an error.

**`GUILD_ID` — set it or not?**
Leave it blank → commands register *globally*, which can take up to an hour to
propagate to a server, and it can take a bit for Discord to actually push the update
to your client. Set it to a specific server ID → commands register instantly in
*that one server only*. While testing, set it; leave it blank once you're happy and
want the bot usable in multiple servers.

**Deploy script errors:**
- `401 Unauthorized` → `DISCORD_TOKEN` is wrong or was regenerated since you copied it.
- `Missing Access` / `50001` → `CLIENT_ID` doesn't match this bot's application, or
  the invite URL didn't include the `applications.commands` scope — re-invite the
  bot with a corrected URL.

**Commands still not showing after a successful deploy:**
Restart your Discord client (desktop/web cache slash command lists per-session).

## Cost check

- **Money:** $0. Discord's Bot API is free; you're running the process on your own
  machine/container, not paying for hosting.
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