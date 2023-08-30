FROM node:16-alpine AS build

WORKDIR /app

COPY package.json /app/

CMD ["touch", "yarn.lock"]

RUN yarn install

COPY . /app/

COPY ../../../node_modules/@metamask/ app/node_modules/@metamask/

# Specify the port your app will run on
EXPOSE 8080

# Command to start your app
CMD ["yarn", "serve"]
