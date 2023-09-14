import { EthereumRpcError } from 'eth-rpc-errors';

export function handleChainChangedEvent(debug: boolean | undefined, setChainId: React.Dispatch<React.SetStateAction<string | undefined>>, setConnected: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<EthereumRpcError<unknown> | undefined>>) {
  return (networkVersion: any) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::provider on 'chainChanged' event.`,
        networkVersion
      );
    }
    setChainId(
      (
        networkVersion as {
          chainId?: string;
          networkVersion?: string;
        }
      )?.chainId
    );
    setConnected(true);
    setError(undefined);
  };
}
