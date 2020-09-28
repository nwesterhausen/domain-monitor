FROM node:14

# Create app directory
WORKDIR /app

# App Dependecies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Create volumes
VOLUME /app/config \
    /app/whois-data

EXPOSE 4201

CMD [ "node", "index.js" ]
