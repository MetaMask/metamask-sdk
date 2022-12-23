import MetaMaskSDK from '@metamask/sdk';

export const mainSDK = async () => {
  const sdk = new MetaMaskSDK({
    shouldShimWeb3: false,
    communicationServerUrl: 'http://localhost:4000/',
  });

  const ethereum = sdk.getProvider();

  const accounts = await ethereum.request({
    method: 'eth_requestAccounts',
    params: [],
  });

  console.log('request accounts', accounts);
};
