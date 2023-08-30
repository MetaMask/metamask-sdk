FROM node:16-alpine AS build

WORKDIR /app

COPY package.json /app/

CMD ["touch", "yarn.lock"]

RUN yarn install

COPY . /app/

COPY ../../../node_modules/@metamask/ app/node_modules/@metamask/

EXPOSE 3334

# Command to start your app
CMD ["yarn", "dev"]
