# Use the official Node.js 18 image as a parent image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 make g++

# Copy the package.json and yarn.lock files into the working directory
COPY package.json ./
COPY yarn.lock ./

# Install Yarn
# RUN npm install -g yarn

# Install dependencies
RUN yarn install

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Build the application
RUN yarn build

# Inform Docker that the container is listening on port 3000 at runtime.
EXPOSE 3000

# Define the command to run the app using `yarn start`
CMD [ "yarn", "start" ]
