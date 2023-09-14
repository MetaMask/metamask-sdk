import { EthereumRpcError } from 'eth-rpc-errors';
import { SDKProvider } from '@metamask/sdk';

export function handleInitializedEvent(
  debug: boolean | undefined,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>,
  activeProvider: SDKProvider,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) {
  return () => {
    if (debug) {
      console.debug(`MetaMaskProvider::provider on '_initialized' event.`);
    }
    setConnecting(false);
    setAccount(activeProvider?.selectedAddress || undefined);
    setConnected(true);
    setError(undefined);
  };
}
