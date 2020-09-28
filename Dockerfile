FROM node:14

# Create app directory
WORKDIR /usr/src/app

# App Dependecies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

# Create volumes
VOLUME /usr/src/app/config \
    /usr/src/app/whois-data

EXPOSE 4201

CMD [ "node", "index.js" ]
