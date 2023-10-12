import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';
import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';

export const useHandleProviderEvent = ({
  debug,
  setConnecting,
  setConnected,
  setTrigger,
  setError,
  setChainId,
  setAccount,
  sdk,
}: EventHandlerProps) => {
  return useCallback(
    (type: PROVIDER_UPDATE_TYPE) => {
      if (debug) {
        console.debug(
          `MetaMaskProvider::sdk on '${EventType.PROVIDER_UPDATE}' event.`,
          type,
        );
      }
      if (type === PROVIDER_UPDATE_TYPE.TERMINATE) {
        setConnecting(false);
      } else if (type === PROVIDER_UPDATE_TYPE.EXTENSION) {
        setConnecting(false);
        setConnected(true);
        setError(undefined);
        // Extract chainId and account from provider
        const extensionProvider = sdk?.getProvider();
        const extensionChainId = extensionProvider?.chainId || undefined;
        const extensionAccount =
          extensionProvider?.selectedAddress || undefined;
        if (debug) {
          console.debug(
            `[MetaMaskProvider] extensionProvider chainId=${extensionChainId} selectedAddress=${extensionAccount}`,
          );
        }
        setChainId(extensionChainId);
        setAccount(extensionAccount);
      }
      setTrigger((_trigger) => _trigger + 1);
    },
    [debug, setConnecting, setTrigger, setConnected, setError],
  );
};
