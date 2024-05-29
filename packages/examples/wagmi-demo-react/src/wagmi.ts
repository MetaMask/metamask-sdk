import { del, get, set } from 'idb-keyval'
import { createConfig, http } from 'wagmi'
import { celo, mainnet, optimism, sepolia } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, metaMask } from 'wagmi/connectors'

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

  chains: [mainnet, sepolia, optimism, celo],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Wagmi - Vite React Playground',
      },
      logging: {
        sdk: true,
        remoteLayer: true,
        keyExchangeLayer: true,
        serviceLayer: true,
        developerMode: true,
      },
      // infuraAPIKey: '8853e8cc66144fc88ae7a53b484aaa76',
      useDeeplink: true,
    }),
    walletConnect({
      projectId: "017a80231854c3b1c56df7bb46bba859",
    }),
    coinbaseWallet({ appName: 'Vite React Playground', darkMode: true }),
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
