// eslint-disable-next-line import/no-unassigned-import
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createClient, MetaMaskProvider, WagmiConfig } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';
import { MetaMaskSDKOptions } from '@metamask/sdk';
import { getDefaultProvider } from 'ethers'

const serverClient = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

export default function App({ Component, pageProps }: AppProps) {
  const [sdkOptions, setSDKOptions] = useState<MetaMaskSDKOptions>();
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setSDKOptions({
      // communicationServerUrl: 'http://192.168.50.114:4000',
      logging: {
        developerMode: true,
        sdk: true,
        plaintext: true,
      },
      autoConnect: {
        enable: false,
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
            <WagmiConfig client={serverClient}><Component {...pageProps} /></WagmiConfig>
          )
      }
    </>);
}
