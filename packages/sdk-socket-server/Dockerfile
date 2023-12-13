# Build stage
FROM node:18-alpine AS builder

# Accept NODE_ENV as a build argument
ARG NODE_ENV=production

# Set the NODE_ENV environment variable
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./

# Install all dependencies including devDependencies
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Runtime stage
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# If NODE_ENV is development, install all dependencies, else only production dependencies
RUN if [ "$NODE_ENV" = "development" ]; then yarn install --frozen-lockfile; else yarn install --production --frozen-lockfile; fi

COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
