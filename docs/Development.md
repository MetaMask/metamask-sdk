# Development Setup

## Prerequisites

- yarn3
- node 16+

We use a monorepo


## Setup

```bash
# checkout the repo
git clone https://github.com/MetaMask/metamask-sdk.git
yarn

## Optionally launch a local socket server to debug the protocol
cd packages/sdk-socket-server
yarn debug

# launch one of the dev application playground, here for nextjs
cd packages/devnext
# if you use a local socket server you can configure it inside the .env file
echo "NEXT_PUBLIC_COMM_SERVER_URL=http://YOUR_LOCAL_IP:4000/" > .env
yarn dev

```
