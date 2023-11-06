import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskUIProvider
      debug={true}
      sdkOptions={{
        communicationServerUrl: process.env.NEXT_PUBLIC_COMM_SERVER_URL,
        enableDebug: true,
        infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
        readonlyRPCMap: {
          '0x539': process.env.NEXT_PUBLIC_PROVIDER_RPCURL ?? '',
        },
        logging: {
          developerMode: true,
          sdk: true,
          remoteLayer: false,
          serviceLayer: false,
          plaintext: true,
        },
        useDeeplink: false,
        checkInstallationImmediately: false,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'DevNext',
          url: 'http://devnext.fakeurl.com',
        },
        i18nOptions: {
          enabled: true,
        },
      }}
    >
      <Component {...pageProps} />
    </MetaMaskUIProvider>
  );
}
