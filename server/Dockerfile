FROM node:22.11.0

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install

COPY . . 

CMD ["npm","run","start"]