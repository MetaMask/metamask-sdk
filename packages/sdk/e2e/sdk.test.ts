import { describe, expect, it } from '@jest/globals';
import { MetaMaskSDK } from '../src';

describe('SDK', () => {
  it('should test correctly', async () => {
    const sdk = new MetaMaskSDK({
      shouldShimWeb3: false,
      communicationServerUrl: 'http://192.168.50.114:5400/',
      dappMetadata: {
        name: 'CustonName',
        url: 'http://whateverwewant',
      },
    });

    const ethereum = sdk.getProvider();

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    console.log('request accounts', accounts);

    expect(true).toBe(true);
  }, 100000000);
});
