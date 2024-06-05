import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { mainnet, optimism, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, sepolia, optimism],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Wagmi',
        url: 'https://wagmi.io',
        iconUrl: 'https://wagmi.io/favicon.ico',
      }
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
