FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY host.key host.key

EXPOSE 22

CMD [ "node", "index.js" ]