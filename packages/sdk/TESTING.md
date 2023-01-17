## e2e

For e2e tests, you can simulate the connection running two separate tests in 2 terminals:

- terminal1: `yarn test -t 'should communicate as a DAPP' --verbose`
  - Copy the qrcode url into the `metamask-simulator-e2e.test.ts` file
- terminal2: `yarn test -t 'should simulate MM mobile' --verbose`
