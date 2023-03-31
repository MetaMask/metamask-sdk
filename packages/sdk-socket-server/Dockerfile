FROM node:16-alpine

RUN apk update && apk upgrade && apk add --no-cache zlib

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 4000

CMD ["yarn","start"]
