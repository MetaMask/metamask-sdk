// eslint-disable-next-line import/no-unassigned-import
import { MetaMaskProvider } from '@metamask/sdk-react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskProvider debug={true} sdkOptions={{
      // communicationServerUrl: 'http://192.168.50.114:4000',
      forceDeleteProvider: true,
      forceInjectProvider: true,
      logging: {
        developerMode: false,
        sdk: true,
        remoteLayer: false,
        serviceLayer: false,
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
    }}><Component {...pageProps} /></MetaMaskProvider>
  );
}
