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

describe('SDK Comm Server', () => {
  it('should test correctly', async () => {
    const sdk = new MetaMaskSDK({
      shouldShimWeb3: false,
    });

    const ethereum = sdk.getProvider();
    console.log(`ethereum: `, ethereum);

    expect(true).toBe(true);
  });
});
