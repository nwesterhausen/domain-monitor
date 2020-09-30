FROM node:14-alpine

# Create app directory
WORKDIR /app

# App Dependecies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production=true

# Bundle app source
COPY . .

# Create volumes
VOLUME /app/config \
    /app/whois-data

EXPOSE 4201

CMD [ "node", "index.js" ]
