FROM node:20-alpine

# Create app directory
WORKDIR /app

# App Dependecies
COPY package.json pnpm-lock.yaml ./

RUN npx pnpm i ci

# Bundle app source
COPY server/sample* server/index.js ./
COPY server/lib ./lib
COPY client/dist ./client

# Create volumes
VOLUME /app/config \
    /app/whois-data

EXPOSE 4201

CMD [ "node", "index.js" ]
