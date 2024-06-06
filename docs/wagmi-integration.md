# Integrating MetaMask SDK with Wagmi for Enhanced dApp Functionality

Wagmi is a powerful and efficient library designed to streamline the development of decentralized applications (dApps) by simplifying Ethereum interactions. Through the MetaMask SDK integration with Wagmi, developers can offer users a seamless and secure way to integrate their MetaMask wallets with dApps, facilitating a wide range of blockchain operations.

This guide explains how to integrate MetaMask SDK into your dApp using Wagmi.

### Prerequisites

Prerequisites
Before proceeding with the integration, ensure you have a basic understanding of Ethereum smart contracts and React Hooks. It's also crucial to start with a Wagmi-based project. If you haven't set up a Wagmi project yet, follow the getting-started guide to create one:

[Getting Started with Wagmi](https://wagmi.sh/react/getting-started)

This guide will provide you with all the necessary steps to set up a new Wagmi project, from installation to initial configuration, ensuring you have the right foundation to integrate the MetaMask SDK.

### Configure Wagmi with MetaMask SDK Connector

The first step in integrating MetaMask with your dApp is to configure Wagmi to use the MetaMask connector. This involves setting up the Wagmi configuration to include MetaMask as a connector and specifying the Ethereum chains your application will support.

```javascript
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Your dApp Name',
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
```

### Filling the dApp Metadata

It is crucial to provide `dappMetadata` when configuring your connector, as it is now a mandatory requirement for integration. This metadata helps in identifying your dApp within the MetaMask ecosystem.

### Implement Contract Interaction Using usePrepareContractWrite

Due to a known issue in Safari where a 500ms timeout can interrupt smart contract interactions, it is recommended to use the `usePrepareContractWrite` hook from Wagmi. This approach ensures smooth transactions by preparing the contract write operation ahead of the actual execution.

```javascript
import { usePrepareContractWrite, useContractWrite } from 'wagmi';

const { config } = usePrepareContractWrite({
  address: '0xContractAddress',
  abi: contractABI,
  functionName: 'functionToCall',
  args: [arg1, arg2],
});

const { write } = useContractWrite(config);

write();
```

### Leverage Infura API for Read-Only Calls

For read-only blockchain calls, it's best practice to use the Infura API. This approach offloads the read operations to Infura's nodes, reducing the load on your own infrastructure and ensuring high availability and reliability.

Refer to this [Documentation](https://github.com/MetaMask/metamask-sdk/blob/main/docs/why-infura-wagmi.md) for insights on why utilizing Infura with Wagmi is beneficial for your dApp.

### Using Universal Links

To avoid issues with deep links on iOS, utilize universal links in your dApp. This ensures a smoother transition for users accessing your dApp from mobile devices, providing a better user experience compared to traditional deep linking methods.

So we don't recommend setting the MetaMaskSDK `useDeeplink` option to `true`.

### Example dApp with Wagmi Integration
Explore our comprehensive example of a dApp integrated with Wagmi to see the implementation in action. Check out our Wagmi Example dApp by following the link below:

[Wagmi Example dApp](https://github.com/MetaMask/metamask-sdk/tree/main/packages/examples/wagmi-demo-react)
