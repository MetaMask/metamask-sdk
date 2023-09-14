import { EthereumRpcError } from 'eth-rpc-errors';

export function handleOnConnectingEvent(
  debug: boolean | undefined,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) {
  return () => {
    if (debug) {
      console.debug(`MetaMaskProvider::provider on 'connecting' event.`);
    }
    setConnected(false);
    setConnecting(true);
    setError(undefined);
  };
}
