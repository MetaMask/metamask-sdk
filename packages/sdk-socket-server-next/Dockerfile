# Build stage
FROM node:18-alpine AS builder

# Install build dependencies and build the project
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build

# Runtime stage
FROM node:18-alpine

# Install runtime dependencies
WORKDIR /app
COPY --from=builder /app/package.json ./
RUN yarn install --production

# Copy built project and .env file from the build stage
COPY --from=builder /app/dist ./dist
# Do not copy .env file, it should be mounted separately
# COPY .env ./

# Expose the server port
EXPOSE 4000

# Start the server
CMD ["node", "dist/src/index.js"]
#  CMD ["sh", "-c", "DEBUG= node dist/index.js"]

# Start the server with DEBUG mode enabled
# CMD ["sh", "-c", "DEBUG=socket.io-redis-streams-adapter node dist/index.js"]
#  CMD ["sh", "-c", "DEBUG=socket.io-redis node dist/index.js"]
