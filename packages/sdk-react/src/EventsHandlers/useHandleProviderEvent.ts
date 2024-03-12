import { EventType, PROVIDER_UPDATE_TYPE } from '@metamask/sdk';
import { useCallback } from 'react';
import { EventHandlerProps } from '../MetaMaskProvider';
import { logger } from '../utils/logger';

export const useHandleProviderEvent = ({
  debug,
  setConnecting,
  setConnected,
  setTrigger,
  setError,
  setChainId,
  setAccount,
  setRPCHistory,
  sdk,
}: EventHandlerProps) => {
  return useCallback(
    (type: PROVIDER_UPDATE_TYPE) => {
      logger(
        `[MetaMaskProvider: useHandleProviderEvent()] on '${EventType.PROVIDER_UPDATE}' event.`,
        type,
      );

      if (type === PROVIDER_UPDATE_TYPE.TERMINATE) {
        setConnecting(false);
      } else if (type === PROVIDER_UPDATE_TYPE.EXTENSION) {
        setConnecting(false);
        setConnected(true);
        setError(undefined);
        // Extract chainId and account from provider
        const extensionProvider = sdk?.getProvider();
        const extensionChainId = extensionProvider?.getChainId() || undefined;
        const extensionAccount =
          extensionProvider?.getSelectedAddress() || undefined;
        logger(
          `[MetaMaskProvider: useHandleProviderEvent()] extensionProvider chainId=${extensionChainId} selectedAddress=${extensionAccount}`,
        );

        setChainId(extensionChainId);
        setAccount(extensionAccount);
      }

      // Always reset RPC history when changing providers
      setRPCHistory({});
      setTrigger((_trigger) => _trigger + 1);
    },
    [debug, setConnecting, setTrigger, setConnected, setError],
  );
};
