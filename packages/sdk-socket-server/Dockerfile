# Build stage
FROM node:18-alpine AS builder

# Accept NODE_ENV as a build argument
ARG NODE_ENV=production

# Set the NODE_ENV environment variable
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Install Yarn v3.5.1
RUN corepack enable
# RUN corepack install yarn@3.5.1
RUN corepack prepare yarn@3.5.1 --activate

# Verify yarn version
RUN yarn --version

COPY package.json ./
COPY yarn.lock ./

# Install all dependencies including devDependencies
RUN yarn install --frozen-lockfile && npm install typescript -g

COPY . .

RUN yarn build

COPY .env ./

EXPOSE 4000
CMD ["node", "dist/index.js"]