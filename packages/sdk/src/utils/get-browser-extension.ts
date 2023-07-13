export function getBrowserExtension({
  mustBeMetaMask,
}: {
  mustBeMetaMask: boolean;
}) {
  if (typeof window === 'undefined') return;

  const { ethereum } = window as { ethereum: any };

  if (!ethereum) {
    throw new Error('Ethereum not found in window object');
  }

  // The `providers` field is populated when CoinBase Wallet extension is also installed
  // The expected object is an array of providers, the MetaMask provider is inside
  // See https://docs.cloud.coinbase.com/wallet-sdk/docs/injected-provider-guidance for
  if (Array.isArray(ethereum.providers)) {
    const provider = mustBeMetaMask
      ? ethereum.providers.find((p: any) => p.isMetaMask)
      : ethereum.providers[0];

    if (!provider) {
      throw new Error('No suitable provider found');
    }

    return provider;
  }

  if (mustBeMetaMask && !ethereum.isMetaMask) {
    throw new Error('MetaMask provider not found in Ethereum');
  }

  return ethereum;
}
