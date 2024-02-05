import { http, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
   chains: [mainnet, polygon],
   connectors: [metaMask({})],
   ssr: true,
   transports: {
      [mainnet.id]: http(),
      [polygon.id]: http()
   }
});

declare module 'wagmi' {
   interface Register {
      config: typeof config;
   }
}
