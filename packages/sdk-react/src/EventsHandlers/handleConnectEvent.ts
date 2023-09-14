import { EthereumRpcError } from 'eth-rpc-errors';

export function handleConnectEvent(debug: boolean | undefined, setConnecting: React.Dispatch<React.SetStateAction<boolean>>, setConnected: React.Dispatch<React.SetStateAction<boolean>>, setChainId: React.Dispatch<React.SetStateAction<string | undefined>>, setError: React.Dispatch<React.SetStateAction<EthereumRpcError<unknown> | undefined>>, chainId: string | undefined) {
  return (connectParam: unknown) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::provider on 'connect' event.`,
        connectParam
      );
    }
    setConnecting(false);
    setConnected(true);
    setChainId((connectParam as { chainId: string; })?.chainId);
    setError(undefined);
    if (chainId) {
      setChainId(chainId);
    }
  };
}
