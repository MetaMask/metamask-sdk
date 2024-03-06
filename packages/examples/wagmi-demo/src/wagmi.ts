import { createConfig, http } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [
    metaMask({
      infuraAPIKey: process.env.INFURA_API_KEY,
      useDeeplink: false,
      dappMetadata: {
        name: 'Wagmi-Demo',
        url: 'https://wagmi.io',
      },
    }),
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
