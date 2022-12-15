import { describe, expect, it } from '@jest/globals';
import MetaMaskSDK from '../src';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sleep = (ms: number) => {
  return new Promise((resolve) => {
    const ref = setTimeout(resolve, ms);
    return () => {
      clearTimeout(ref);
    };
  });
};

describe('SDK', () => {
  it('should test correctly', async () => {
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

    expect(true).toBe(true);
  });
});
