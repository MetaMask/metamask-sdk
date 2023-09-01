import { ethErrors } from 'eth-rpc-errors';
import { SDKProvider } from '../../../provider/SDKProvider';

export function handleDisconnect({
  terminate = false,
  instance,
}: {
  terminate: boolean;
  instance: SDKProvider;
}) {
  if (instance.debug) {
    console.debug(
      `SDKProvider::handleDisconnect() cleaning up provider state terminate=${terminate}`,
      instance,
    );
  }

  if (terminate) {
    instance.chainId = null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.accounts = null;
    instance.selectedAddress = null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.isUnlocked = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.isPermanentlyDisconnected = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._state.initialized = false;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._handleAccountsChanged([]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._state.isConnected = false;
  instance.emit('disconnect', ethErrors.provider.disconnected());

  instance.providerStateRequested = false;
}
