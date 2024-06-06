# Integrating MetaMask SDK with Wagmi for Enhanced dApp Functionality (Wagmi V2)

Wagmi is a powerful and efficient library designed to streamline the development of decentralized applications (dApps) by simplifying Ethereum interactions. Through the MetaMask SDK integration with Wagmi, developers can offer users a seamless and secure way to integrate their MetaMask wallets with dApps, facilitating a wide range of blockchain operations.

This guide explains how to integrate MetaMask SDK into your dApp using Wagmi V2.

### Prerequisites

Before proceeding with the integration, ensure you have a basic understanding of Ethereum smart contracts and React Hooks. It's also crucial to start with a Wagmi-based project. If you haven't set up a Wagmi project yet, follow the getting-started guide to create one:

[Getting Started with Wagmi](https://wagmi.sh/react/getting-started)

This guide will provide you with all the necessary steps to set up a new Wagmi project, from installation to initial configuration, ensuring you have the right foundation to integrate the MetaMask SDK.

### Configure Wagmi with MetaMask SDK Connector

The first step in integrating MetaMask with your dApp is to configure Wagmi to use the MetaMask connector. This involves setting up the Wagmi configuration to include MetaMask as a connector and specifying the Ethereum chains your application will support.

Here's an example of how the `wagmi.ts` file should look:

```typescript
import { createConfig, http } from 'wagmi';
import { celo, mainnet, optimism, sepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, sepolia, optimism, celo],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Wagmi',
        url: 'https://wagmi.io',
        iconUrl: 'https://wagmi.io/favicon.ico',
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
    [celo.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
```

### Filling the dApp Metadata

It is crucial to provide `dappMetadata` when configuring your connector, as it is now a mandatory requirement for integration. This metadata helps in identifying your dApp within the MetaMask ecosystem.

### Implement Contract Interaction Using useWriteContract

In Wagmi V2, interacting with contracts has been streamlined to provide a better developer experience. Here's how you can implement contract interaction using `useWriteContract` and `useSimulateContract`.

```typescript
import { useState, FormEvent } from 'react';
import { useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from '@wagmi/core';

function useMintToken(tokenId: string) {
  const { data } = useSimulateContract({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: parseAbi(['function mint(uint256 tokenId)']),
    functionName: 'mint',
    args: [BigInt(tokenId)],
  });

  const { data: hash, error, isPending, writeContractAsync } = useWriteContract();

  return {
    writeContractAsync: () => writeContractAsync(data!.request),
    hash,
    error,
    isPending,
  };
}

function WriteContract() {
  const [tokenId, setTokenId] = useState<string>('');

  const {
    writeContractAsync: mintToken,
    hash,
    error,
    isPending,
  } = useMintToken(tokenId);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await mintToken();
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return (
    <div>
      <h2>Write Contract</h2>
      <form onSubmit={submit}>
        <input
          name="tokenId"
          placeholder="Token ID"
          required
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button disabled={isPending || isConfirming} type="submit">
          {isConfirming || isPending ? 'Confirming...' : 'Mint'}
        </button>
      </form>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && 'Waiting for confirmation... 🔁'}
      {isConfirmed && 'Transaction confirmed ✅'}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

export default WriteContract;
```

### Leverage Infura API for Read-Only Calls

For read-only blockchain calls, it's best practice to use the Infura API. This approach offloads the read operations to Infura's nodes, reducing the load on your own infrastructure and ensuring high availability and reliability.

Refer to this [Documentation](https://github.com/MetaMask/metamask-sdk/blob/main/docs/why-infura-wagmi.md) for insights on why utilizing Infura with Wagmi is beneficial for your dApp.

### Using Universal Links

To avoid issues with deep links on iOS, utilize universal links in your dApp. This ensures a smoother transition for users accessing your dApp from mobile devices, providing a better user experience compared to traditional deep linking methods.

So we don't recommend setting the MetaMaskSDK `useDeeplink` option to `true`.

This updated guide aligns with the latest Wagmi V2 APIs, providing a more efficient and straightforward approach to integrating MetaMask with your dApp.

### Example dApp with Wagmi Integration
Explore our comprehensive example of a dApp integrated with Wagmi to see the implementation in action. Check out our Wagmi Example dApp by following the link below:

[Wagmi Example dApp](https://github.com/MetaMask/metamask-sdk/tree/main/packages/examples/wagmi-demo-react)
