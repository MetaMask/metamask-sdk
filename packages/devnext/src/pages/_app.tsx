import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { SDKConfigProvider, useSDKConfig } from '@metamask/sdk-react';
import type { AppProps } from 'next/app';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import { UIProvider } from '@metamask/sdk-ui';
import React from 'react';
import { Layout } from '../components/layout';
import '../styles/globals.css';
import '../styles/icons.css';

config.autoAddCss = false;

const WithSDKConfig = ({ children }: { children: React.ReactNode }) => {
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    _experimentalDeeplinkProtocol,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskUIProvider
      debug={true}
      sdkOptions={{
        communicationServerUrl: socketServer,
        enableAnalytics: true,
        // Display desktop tab instead of qrcode tab
        preferDesktop: false,
        infuraAPIKey,
        readonlyRPCMap: {
          '0x539': process.env.NEXT_PUBLIC_PROVIDER_RPCURL ?? '',
        },
        extensionOnly: false,
        _experimentalDeeplinkProtocol,
        logging: {
          developerMode: true,
          remoteLayer: true,
          serviceLayer: true,
          sdk: true,
          plaintext: true,
        },
        useDeeplink,
        checkInstallationImmediately,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'DevNext',
          url: window.location.protocol + '//' + window.location.host,
          iconUrl:
            window.location.protocol +
            '//' +
            window.location.host +
            '/favicon.ico',
        },
        i18nOptions: {
          enabled: true,
        },
      }}
    >
      {children}
    </MetaMaskUIProvider>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SDKConfigProvider
        initialSocketServer={process.env.NEXT_PUBLIC_COMM_SERVER_URL}
        initialInfuraKey={process.env.NEXT_PUBLIC_INFURA_API_KEY}
        _initialExperimentalDeeplinkProtocol={false}
        debug={true}
      >
        <WithSDKConfig>
          <UIProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </UIProvider>
        </WithSDKConfig>
      </SDKConfigProvider>
    </SafeAreaProvider>
  );
}
