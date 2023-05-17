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
  const [sdkOptions, setSDKOptions] = useState<MetaMaskSDKOptions>({ autoInit: false });
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    console.debug(`INIT NOW`);
    setSDKOptions({
      communicationServerUrl: 'http://192.168.50.114:4000',
      logging: {
        developerMode: false,
        sdk: true,
        plaintext: true,
      },
      autoInit: true,
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
            <WagmiConfig client={serverClient}><Component {...pageProps} /></WagmiConfig>
          )
      }
    </>);
}
