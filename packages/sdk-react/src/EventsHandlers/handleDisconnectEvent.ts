import { EthereumRpcError } from 'eth-rpc-errors';

export function handleDisconnectEvent(debug: boolean | undefined, setConnecting: React.Dispatch<React.SetStateAction<boolean>>, setConnected: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<EthereumRpcError<unknown> | undefined>>) {
  return (reason: unknown) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::provider on 'disconnect' event.`,
        reason
      );
    }
    setConnecting(false);
    setConnected(false);
    setError(reason as EthereumRpcError<unknown>);
  };
}
