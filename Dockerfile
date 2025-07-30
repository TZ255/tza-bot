FROM node:22.15.0-slim

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxfixes3 \
    libnss3 \
    libcups2 \
    libatspi2.0-0 \
    libdrm2 \
    libgbm1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p .wwebjs_auth && chown -R node:node .wwebjs_auth && chmod -R 755 .wwebjs_auth

EXPOSE 4000

ENV NODE_ENV=production

# Change ownership of the entire app directory to node user
RUN chown -R node:node /app

USER node

CMD ["npm", "dev"]
# CMD ["npm", "start"] # Uncomment this line to run the app in production mode