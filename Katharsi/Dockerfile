FROM node:20-slim

WORKDIR /app

# Install deps first, separately from app code, so Docker's layer cache skips
# `npm install` on rebuilds where only your .js files changed (faster iterate loop).
COPY package*.json ./
RUN npm install --omit=dev

# Now copy the rest of the app.
COPY . .

ENV NODE_ENV=production

# backups/ needs to survive container restarts/recreates — mount a volume at
# this path when you run the container (see README), or the JSON snapshots
# vanish the moment the container is removed.
RUN mkdir -p backups

# Run as the non-root `node` user baked into this base image, not root.
# Least-privilege: this process only needs to read its own files and talk
# to Discord's API, no reason to run it as root.
RUN chown -R node:node /app
USER node

# Deploy (register) slash commands, THEN start the bot. `;` not `&&`, on
# purpose — if a redeploy fails (e.g. rate limited) you still want the bot to
# come online and you still want to see the failure in `docker logs`, rather
# than the container silently exiting.
CMD ["sh", "-c", "node deploy-commands.js; node index.js"]