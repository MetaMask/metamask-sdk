// eslint-disable-next-line import/no-unassigned-import
import { MetaMaskProvider } from '@metamask/sdk-react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskProvider debug={true} sdkOptions={{
      logging: {
        developerMode: true,
        sdk: false,
        remoteLayer: false,
        serviceLayer: false,
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
    }}><Component {...pageProps} /></MetaMaskProvider>
  );
}
