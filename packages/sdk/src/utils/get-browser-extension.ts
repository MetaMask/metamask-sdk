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
    throw new Error('window not available');
  }

  try {
    // Try EIP-6963 first
    const extensionProvider = await eip6963RequestProvider();
    return wrapExtensionProvider({ provider: extensionProvider, sdkInstance });
  } catch (e) {
    // Legacy fallback only for non-MetaMask cases
    if (!mustBeMetaMask && window.ethereum) {
      return wrapExtensionProvider({
        provider: window.ethereum,
        sdkInstance,
      });
    }

    throw new Error('Provider not found');
  }
}
