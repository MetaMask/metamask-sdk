import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskUIProvider debug={true} sdkOptions={{
      communicationServerUrl: process.env.NEXT_PUBLIC_COMM_SERVER_URL,
      logging: {
        developerMode: true,
        sdk: false,
        remoteLayer: true,
        serviceLayer: true,
        plaintext: true,
      },
      checkInstallationImmediately: false,
      storage: {
        enabled: true,
      },
      dappMetadata: {
        name: 'DevNext',
        url: 'http://devnext.fakeurl.com',
      }
    }}><Component {...pageProps} /></MetaMaskUIProvider>
  );
}
