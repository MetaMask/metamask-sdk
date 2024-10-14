# Socket Server Performance Test

## Dependencies
Install Artillery
```bash
npm install -g artillery
```

Install Dependencies (node 16)
```bash
yarn install
```

## Run
### Generate UUIDs
```bash
yarn generate:uuid
```


### Run tests for a given environment
```bash
yarn test:dev
yarn test:test
```

### Generate a report
```bash
yarn generate:report-dev
yarn generate:report-test
```

## Current Scenarios
- Persistent Connection over 60s: each Vuser connects for 60s
- Permanent Connection: each Vuser connects for an hour. This is higher than the time that the test takes to run which is intended. This is a non-realistic use case where a user would be connected for ober an hour, it is meant to simulate a soak of persistent connections.
- Create a channel and ACK: each Vuser connects for 60s, creates a channel, and ACKs the channel. This is a realistic use case where a user would connect, creates a channel and checks the response.