import { del, get, set } from 'idb-keyval'
import { createConfig, http } from 'wagmi'
import { celo, mainnet, optimism, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const indexedDBStorage = {
  async getItem(name: string) {
    return get(name)
  },
  async setItem(name: string, value: string) {
    await set(name, value)
  },
  async removeItem(name: string) {
    await del(name)
  },
}

export const config = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, sepolia, optimism, celo],
  connectors: [
    coinbaseWallet(),
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
