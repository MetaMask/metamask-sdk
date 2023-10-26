import { SDKProvider } from '../provider/SDKProvider';
import { wrapExtensionProvider } from '../provider/WrapExtensionProvider';
import { eip6963RequestProvider } from './eip6963RequestProvider';

export async function getBrowserExtension({
  mustBeMetaMask,
}: {
  mustBeMetaMask: boolean;
}): Promise<SDKProvider> {
  if (typeof window === 'undefined') {
    throw new Error(`window not available`);
  }

  let baseProvider: SDKProvider;

  try {
    baseProvider = await eip6963RequestProvider();

    return wrapExtensionProvider(baseProvider);
  } catch (e) {
    const { ethereum } = window as unknown as {
      ethereum:
        | (SDKProvider & {
            isMetaMask: boolean;
          })
        | { providers: any[] };
    };

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

        return wrapExtensionProvider(provider as SDKProvider);
      }
    } else if (mustBeMetaMask && !ethereum.isMetaMask) {
      throw new Error('MetaMask provider not found in Ethereum');
    }

    return wrapExtensionProvider(ethereum as SDKProvider);
  }
}
