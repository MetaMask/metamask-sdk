import { MetaMaskInpageProvider } from '@metamask/providers';
import { MetaMaskSDK } from '../sdk';
import { wrapExtensionProvider } from '../provider/wrapExtensionProvider';
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

  try {
    const extensionProvider = await eip6963RequestProvider();
    return wrapExtensionProvider({ provider: extensionProvider, sdkInstance });
  } catch (e) {
    if (mustBeMetaMask) {
      throw new Error('MetaMask provider not found via EIP-6963');
    }

    const { ethereum } = window;
    if (!ethereum) {
      throw new Error('Ethereum not found in window object');
    }

    return wrapExtensionProvider({
      provider: ethereum,
      sdkInstance,
    });
  }
}
