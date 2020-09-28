FROM node:14

# Create app directory
WORKDIR /usr/src/app

# App Dependecies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

EXPOSE 4201

CMD [ "node", "index.js" ]
