FROM node:20-slim

WORKDIR /app

# Install dependencies using package-lock/package.json
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

ENV NODE_ENV=production

# Start the bot (adjust entrypoint if different)
CMD ["node", "index.js"]