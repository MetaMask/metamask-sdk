import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  MetaMaskProvider,
  useSDKConfig,
  SDKConfigProvider,
} from '@metamask/sdk-react';
import type { AppProps } from 'next/app';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

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
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskProvider
      debug={true}
      sdkOptions={{
        communicationServerUrl: socketServer,
        enableDebug: true,
        infuraAPIKey,
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
        useDeeplink,
        checkInstallationImmediately,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'DevNext',
          url: window.location.protocol + '//' + window.location.host,
        },
        i18nOptions: {
          enabled: true,
        },
      }}
    >
      {children}
    </MetaMaskProvider>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SDKConfigProvider
        initialSocketServer={process.env.NEXT_PUBLIC_COMM_SERVER_URL}
        initialInfuraKey={process.env.NEXT_PUBLIC_INFURA_API_KEY}
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
