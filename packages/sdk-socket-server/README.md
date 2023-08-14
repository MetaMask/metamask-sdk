# Debug SDK socket Server

- Create and adjust your env file with correct settings `cp .env.sample .env`
- Launch the sdk server for local development `yarn start`

# Debug SDK socket Cluster Server

- Launch the sdk server for local development `yarn start:cluster`
- P.S You need to have redis running on your machine. If you don't have it, you can run it with docker `docker run -p 6379:6379 redis`

# Debug SDK socket Cluster Server (preferred)

- Launch the docker images for Redis server and Socket.io server for local development `yarn start:server`
- To stop the servers: `yarn stop:server`
