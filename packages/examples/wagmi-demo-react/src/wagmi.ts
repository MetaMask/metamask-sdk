import { createConfig, http } from 'wagmi'
import { celo, mainnet, optimism, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'


export const config = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, sepolia, optimism, celo],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Wagmi',
        url: 'https://wagmi.io',
        iconUrl: 'https://wagmi.io/favicon.ico',
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
    [celo.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
