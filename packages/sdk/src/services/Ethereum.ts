import { initializeProvider as initProvider } from '@metamask/providers';

const Ethereum = {
  ethereum: null,
  initializeProvider({
    shouldSetOnWindow,
    connectionStream,
    shouldShimWeb3 = true,
  }) {
    // Initialize provider object (window.ethereum)
    this.ethereum = initProvider({
      shouldSetOnWindow,
      // @ts-ignore
      connectionStream,
      shouldSendMetadata: false,
      shouldShimWeb3,
    });

    return this.ethereum;
  },
};

export default Ethereum;
