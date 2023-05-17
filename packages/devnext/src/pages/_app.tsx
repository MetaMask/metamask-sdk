// eslint-disable-next-line import/no-unassigned-import
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, mainnet, MetaMaskProvider, WagmiConfig } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';
import { MetaMaskSDKOptions } from '@metamask/sdk';
import { getDefaultProvider } from 'ethers'
import { publicProvider } from '@wagmi/core/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()],
)

const serverConfig = createConfig({
  autoConnect: true,
  publicClient,
})

export default function App({ Component, pageProps }: AppProps) {
  const [sdkOptions, setSDKOptions] = useState<MetaMaskSDKOptions>();
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setSDKOptions({
      // communicationServerUrl: 'http://192.168.50.114:4000',
      logging: {
        developerMode: false,
        sdk: false,
        plaintext: true,
      },
      autoConnect: {
        enable: true,
      },
      storage: {
        enabled: true,
      },
      dappMetadata: {
        name: 'DevNext',
        url: 'http://devnext.fakeurl.com',
      }
    })
    setClientSide(true);
  }, []);

  return (
    <>
      {
        clientSide ?
          <MetaMaskProvider sdkOptions={sdkOptions}><Component {...pageProps} /></MetaMaskProvider> :
          (
            <WagmiConfig config={serverConfig}><Component {...pageProps} /></WagmiConfig>
          )
      }
    </>);
}
