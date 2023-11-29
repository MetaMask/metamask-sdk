// test
import type { MetaMaskSDK, MetaMaskSDKOptions } from '@metamask/sdk';
import type { WalletInit, createEIP1193Provider } from '@web3-onboard/common';

type ImportSDK = {
  createEIP1193Provider: typeof createEIP1193Provider;
  MetaMaskSDKConstructor: typeof MetaMaskSDK;
};

const loadImports = async () => {
  if (importPromise) {
    return await importPromise;
  }

  const { createEIP1193Provider } = await import('@web3-onboard/common');
  const importedSDK = await import('@metamask/sdk');
  const MetaMaskSDKConstructor =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    importedSDK.MetaMaskSDK || importedSDK.default.MetaMaskSDK;

  if (!MetaMaskSDKConstructor) {
    throw new Error('Error importing and initializing MetaMask SDK');
  }

  return { createEIP1193Provider, MetaMaskSDKConstructor };
};

let importPromise: Promise<ImportSDK> | null = null;
let sdk: MetaMaskSDK | null = null;
let createInstance: typeof createEIP1193Provider;

function metamask({
  options,
}: {
  options: Partial<MetaMaskSDKOptions>;
}): WalletInit {
  return () => {
    importPromise = loadImports().catch((error) => {
      throw error;
    });

    const getProvider = (_sdk: MetaMaskSDK) => {
      const provider = createInstance(_sdk.getProvider(), {});
      provider.disconnect = () => {
        sdk?.terminate();
      };
      return provider;
    };

    return {
      label: 'MetaMask',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getIcon: async () => 'ok',
      getInterface: async ({ appMetadata }) => {
        sdk = (window as any).mmsdk || sdk; // Prevent conflict with existing mmsdk instances

        if (sdk) {
          // Prevent re-initializing instance as it causes issues with MetaMask sdk mobile provider.
          return {
            provider: sdk.getProvider() as any,
            instance: sdk,
          };
        }

        const { name, icon } = appMetadata || {};
        const base64 = window.btoa(icon || '');
        const appLogoUrl = `data:image/svg+xml;base64,${base64}`;
        const imports = await importPromise;

        // Patch issue with MetaMask SDK, remove after SDK is fixed
        localStorage.removeItem('providerType');

        if (
          !imports?.MetaMaskSDKConstructor ||
          !imports?.createEIP1193Provider
        ) {
          throw new Error('Error importing and initializing MetaMask SDK');
        }

        const { createEIP1193Provider, MetaMaskSDKConstructor } = imports;

        createInstance = createEIP1193Provider;
        sdk = new MetaMaskSDKConstructor({
          ...options,
          dappMetadata: {
            name: options.dappMetadata?.name || name || '',
            base64Icon: appLogoUrl,
          },
          _source: 'web3-onboard',
        });
        await sdk.init();

        const provider = getProvider(sdk);

        const _request = provider.request;
        (provider as any).request = async ({ method, params }) => {
          if (sdk?.isExtensionActive()) {
            return (window.extension as any).request({ method, params });
          }
          return _request({ method, params }) as Promise<any>;
        };

        return {
          provider,
          instance: sdk,
        };
      },
    };
  };
}

export default metamask;
