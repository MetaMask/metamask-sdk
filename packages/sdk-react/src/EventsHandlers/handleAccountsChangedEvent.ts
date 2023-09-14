import { EthereumRpcError } from 'eth-rpc-errors';

export const handleAccountsChangedEvent = (
  debug: boolean | undefined,
  setAccount: React.Dispatch<React.SetStateAction<string | undefined>>,
  setConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<
    React.SetStateAction<EthereumRpcError<unknown> | undefined>
  >,
) => {
  return (newAccounts: any) => {
    if (debug) {
      console.debug(
        `MetaMaskProvider::provider on 'accountsChanged' event.`,
        newAccounts,
      );
    }
    setAccount((newAccounts as string[])?.[0]);
    setConnected(true);
    setError(undefined);
  };
};
