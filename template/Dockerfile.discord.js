FROM node:20-slim

WORKDIR /app

# Install dependencies using package-lock/package.json
COPY package*.json ./
# Install dependencies (using npm install as requested)
RUN npm install

# Copy application files
COPY . .

ENV NODE_ENV=production

# Start the bot: prefer `npm start` if present, otherwise run `node index.js`
CMD ["sh", "-c", "npm start || node index.js"]
