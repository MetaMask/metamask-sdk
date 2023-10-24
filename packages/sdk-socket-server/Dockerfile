# Build stage
FROM node:18-alpine AS builder

# Install build dependencies and build the project
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Runtime stage
FROM node:18-alpine

# Install runtime dependencies
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built project from the build stage
COPY --from=builder /app/dist ./dist

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"]
