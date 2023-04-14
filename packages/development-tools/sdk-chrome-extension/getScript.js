const fs = require('fs');

const bundle = fs.readFileSync('../../sdk/dist/browser/iife/metamask-sdk.js');

const file = `
${bundle};
const sdk = new MetaMaskSDK({
  useDeeplink: true,
  dappMetadata: { name: 'Chrome SDK Extension', url: 'N/A' },
});
console.log('SDK Loaded', sdk);
`;

fs.writeFileSync('src/sdk.js', file);
