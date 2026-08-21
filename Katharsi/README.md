# Katharsi 🔥

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
| `/nuke [channel]` | **Instant clear.** Clones the target channel (same name, permissions, position) and deletes the original — recreated empty immediately. This is the trick real "nuke" bots use — deleting messages one-by-one is rate-limited and slow; deleting+recreating the channel is a single API round trip. Backs up the server first. |
| `/delete [channel]` | **Permanent delete.** Unlike `/nuke`, the channel is *not* recreated — it's just gone, recoverable only via `/restore`. Backs up the server first. |
| `/delete-category <category> <mode>` | Deletes a category. `mode` is a required choice: delete the category **and** every channel inside it, or delete **only** the category and leave its channels behind (uncategorized). Button-confirmed (15s timeout). Backs up the server first. |
| `/fullnuke` | Backs up the *entire* server's channel/category structure, then deletes every channel and category, and leaves behind one `#start-here` channel so you always have somewhere to run `/restore` from. Server itself is untouched — invite link, roles, members, settings all stay. Button-confirmed (15s timeout). |
| `/backup` | Snapshots the current structure without deleting anything — handy to run before manual changes too. |
| `/restore` | Rebuilds categories and channels from the last backup: names, positions, topics, NSFW flags, voice bitrate/user limits, and permission overwrites (matched back to existing roles/members). **Works two ways** — see below. |

### `/restore` in a server vs. in a DM

- **Run inside a server** → restores that server immediately, same as every
  other command here.
- **Run in your DM with the bot** → the bot doesn't guess which server you mean.
  It scans every server it shares with you, keeps only the ones where a backup
  exists *and* you currently have Administrator, and shows you a dropdown to
  pick from. If none qualify, it tells you why instead of failing silently.
  Admin status is re-checked at the moment you pick, not just when the list was
  built, in case anything changed in between.

This is the one command registered **globally** rather than per-server (see
[Setup](#setup) — it needs `applications.commands` scope and the global command
propagation window below). Every other command stays server-scoped on purpose:
they're destructive, so requiring you to be physically inside the server to run
them is a feature, not a limitation.

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
   `/restore` also needs to work in DMs, which requires no extra invite step —
   just that the two of you share a server the bot is in.
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

The included `Dockerfile` runs `deploy-commands.js` automatically on every
container start, right before `index.js` — so you don't have to remember to do it
by hand. It won't re-invite the bot or duplicate commands; Discord's registration
endpoint just overwrites the existing command list each time, which is cheap and
safe to call repeatedly.

```bash
mkdir -p backups   # do this on the HOST, once, before first run — see note below
docker build -t Katharsi .

docker run -d \
  --name katharsi \
  --env-file .env \
  -v $(pwd)/backups:/app/backups \
  Katharsi
```

- `--env-file .env` passes in `DISCORD_TOKEN` / `CLIENT_ID` / `GUILD_ID` at
  runtime — they're deliberately **not** baked into the image (see
  `.dockerignore`), so you're not shipping your bot token inside a container layer.
- `-v $(pwd)/backups:/app/backups` is a **bind mount**: it maps the container's
  `backups/` folder directly onto a `backups/` folder next to this README, on your
  actual filesystem. This matters — a *named* volume (`-v somename:/app/backups`)
  also persists data, but Docker stores it under `/var/lib/docker/volumes/...`,
  invisible in `~/discord-bots`. If you went looking for the folder here and didn't
  see it, that's why. The bind mount above fixes that: run `/backup` or `/fullnuke`
  and you'll see `backups/<guildId>.json` appear right in this directory.
- Run `mkdir -p backups` on the host **before** `docker run`, not after. If Docker
  creates the folder for you on first mount, it's owned by `root`, and the
  container runs as the non-root `node` user — writes would fail with `EACCES`.
  Pre-creating it as your own user avoids that (works as-is on a typical
  single-user Linux desktop, since your user and the container's `node` user both
  default to uid 1000).

Check it worked:
```bash
docker logs katharsi
```
You should see the deploy script's own output (`Registering 4 commands...` /
`✅ Commands registered.`) followed by `🔥 Katharsi is online as ...`. If you
only see the "online" line and no "Registering" line above it, the deploy step
didn't run — rebuild the image to pick up the current `Dockerfile`.

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

**`/restore` doesn't show up in a DM yet:**
It's registered as a *global* command, which can take up to an hour to propagate
the first time (unlike the guild commands, which are instant). If it's been longer
than that, confirm you actually share a server with the bot — DM commands only
work between accounts that share at least one server together.

**`/restore` in a DM says no eligible servers, but you know a backup exists:**
The list only includes servers where you currently hold Administrator. If your
role changed since the backup was made, or the bot was removed from that server,
it won't appear — run `/restore` from inside the server directly instead, if you
still can.

**`DiscordAPIError[10002]: Unknown Application` during deploy:**
`CLIENT_ID` in `.env` doesn't match any application. Re-copy the **Application ID**
(not the public key, not the OAuth2 secret) from your app's General Information
page, check for a stray space/newline, and confirm it's the same application the
bot token in `.env` belongs to.

**`DiscordAPIError[10008]: Unknown Message` in the logs after `/nuke`:**
This happens specifically when you nuke the channel you *ran the command in* —
deleting it also deletes the deferred reply Discord created there, so the final
confirmation edit 404s even though the nuke itself succeeded. Fixed in
`commands/nuke.js`: it now skips that doomed `editReply` when self-nuking and
relies on the confirmation message already posted in the freshly cloned channel.

**`/restore` doesn't respond / isn't reachable after `/fullnuke`:**
`/fullnuke` deletes every channel — including the one you'd type `/restore` in.
Guild slash commands also don't work from DMs (no guild context, and it'd be
ambiguous which server you meant if the bot's in more than one). `fullnuke.js` now
leaves behind a single `#start-here` channel specifically so `/restore` always has
somewhere to be run from — don't delete that channel until you've either restored
or decided you don't need to.

**Backups aren't appearing in the `backups/` folder next to this README:**
If you're running via Docker with a *named* volume (`-v somename:/app/backups`),
the data is safely persisted but stored inside Docker's own volume storage, not as
a visible folder here. Switch to the bind mount shown in
[Running it (Docker)](#running-it-docker) — `-v $(pwd)/backups:/app/backups` — to
see the JSON files appear directly in this directory.

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