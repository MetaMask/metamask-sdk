# truffle

Simple project to deploy basic contracts and test interactions with the sdk.

## Run Ganache locally

```bash
# this will spinup an evm chainid 1337 on port 8545
yarn ganache

# in a separate terminate deploy the contract
yarn truffle migrate --network development
# or use a custom network
yarn truffle migrate --network custom
# previous command will automatically create the typescript bindings in ./types/truffle-contracts

# use ngrok to expose the port 8545 to the internet and local testing
ngrok http 8545

```
