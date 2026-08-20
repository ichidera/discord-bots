# discord-bots
An archive of my Discord Bots

## Docker Compose

If you have a `docker-compose.yml` at the repository root, build and run the services with:

```bash
docker compose build
docker compose up -d
```

To rebuild after code changes:

```bash
docker compose build --no-cache
docker compose up -d
```

If your services rely on environment variables, create a `.env` file at the repository root (see `Katharsi/.env` for an example) and Docker Compose will pick it up automatically.

## Bots

### Katharsi

Location: `Katharsi/`

Brief: Moderation and utility Discord bot built with `discord.js`.


