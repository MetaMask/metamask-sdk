import { MetaMaskSDK } from '@metamask/sdk';

export const mainSDK = async () => {
  const sdk = new MetaMaskSDK({
    shouldShimWeb3: false,
    // communicationServerUrl: 'http://localhost:4000/',
    dappMetadata: {
      name: 'NodeJS Console',
      url: 'N/A',
    },
  });

  const accounts = await sdk.connect();

  console.log(`connected with accounts`, accounts);
  const ethereum = sdk.getProvider();
  const balance = await ethereum.request({
    method: 'eth_getBalance',
    params: accounts,
  });

  console.debug(`account balance`, balance);
};
