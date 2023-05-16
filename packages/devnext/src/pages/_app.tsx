// eslint-disable-next-line import/no-unassigned-import
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';
import { MetaMaskSDKOptions } from '@metamask/sdk';

export default function App({ Component, pageProps }: AppProps) {
  const [sdkOptions, setSDKOptions] = useState<MetaMaskSDKOptions>({ autoConnect: { enable: false } });

  useEffect(() => {
    setSDKOptions({
      communicationServerUrl: 'http://192.168.50.114:4000',
      logging: {
        developerMode: false,
      },
      autoConnect: {
        enable: true,
      },
      dappMetadata: {
        name: 'DevNext',
        url: 'http://devnext.fakeurl.com',
      }
    })
  }, []);

  return (<MetaMaskProvider sdkOptions={sdkOptions}><Component {...pageProps} /></MetaMaskProvider>);
}
