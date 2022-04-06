const MetaMaskSDK = require('@metamask/sdk');

const sdk = new MetaMaskSDK({
  shouldShimWeb3: false,
  showQRCode: true,
});

const ethereum = sdk.getProvider();

ethereum
  .request({
    method: 'eth_requestAccounts',
    params: [],
  })
  .then((res) => console.log('request accounts', res))
  .catch((e) => console.log('request accounts ERR', e));
