import { MetaMaskInpageProvider } from '@metamask/providers';
import { wrapExtensionProvider } from '../provider/wrapExtensionProvider';
import { MetaMaskSDK } from '../sdk';
import { eip6963RequestProvider } from './eip6963RequestProvider';

export async function getBrowserExtension({
  mustBeMetaMask,
  sdkInstance,
}: {
  mustBeMetaMask: boolean;
  sdkInstance: MetaMaskSDK;
}): Promise<MetaMaskInpageProvider> {
  if (typeof window === 'undefined') {
    throw new Error(`window not available`);
  }

  let extensionProvider: MetaMaskInpageProvider;

  try {
    extensionProvider = await eip6963RequestProvider();
    return wrapExtensionProvider({ provider: extensionProvider, sdkInstance });
  } catch (e) {
    const { ethereum } = window;

    if (!ethereum) {
      throw new Error('Ethereum not found in window object');
    }

    // The `providers` field is populated when CoinBase Wallet extension is also installed
    // The expected object is an array of providers, the MetaMask provider is inside
    // See https://docs.cloud.coinbase.com/wallet-sdk/docs/injected-provider-guidance for
    if ('providers' in ethereum) {
      if (Array.isArray(ethereum.providers)) {
        const provider = mustBeMetaMask
          ? ethereum.providers.find((p: any) => p.isMetaMask)
          : ethereum.providers[0];

        if (!provider) {
          throw new Error('No suitable provider found');
        }

        return wrapExtensionProvider({ provider, sdkInstance });
      }
    } else if (mustBeMetaMask && !ethereum.isMetaMask) {
      throw new Error('MetaMask provider not found in Ethereum');
    }

    return wrapExtensionProvider({
      provider: ethereum,
      sdkInstance,
    });
  }
}
