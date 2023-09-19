import { MetaMaskSDK } from '../../../sdk';
import { setupInfuraProvider } from './setupInfuraProvider';

describe('setupInfuraProvider', () => {
  let instance: MetaMaskSDK;

  beforeEach(() => {
    instance = new MetaMaskSDK({
      dappMetadata: {
        name: 'test',
        url: 'test',
      },
    });
  });

  it('should not set up infura provider if infuraAPIKey is not provided', async () => {
    await setupInfuraProvider(instance);
    expect(instance.options.readonlyRPCMap).toBeUndefined();
  });

  it('should set up infura provider with infuraAPIKey', async () => {
    instance.options.infuraAPIKey = 'testKey';
    await setupInfuraProvider(instance);
    expect(instance.options.readonlyRPCMap?.['0x1']).toBe(
      `https://mainnet.infura.io/v3/testKey`,
    );
    // ... add other checks for all the other RPC URLs as needed
  });

  it('should extend existing readonlyRPCMap', async () => {
    instance.options.infuraAPIKey = 'testKey';
    instance.options.readonlyRPCMap = {
      '0xExisting': 'https://existing-rpc-url',
    };

    await setupInfuraProvider(instance);

    expect(instance.options.readonlyRPCMap['0xExisting']).toBe(
      'https://existing-rpc-url',
    );

    expect(instance.options.readonlyRPCMap['0x1']).toBe(
      `https://mainnet.infura.io/v3/testKey`,
    );
    // ... add other checks for all the other RPC URLs as needed
  });
});
