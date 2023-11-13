import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';
import type { AppProps } from 'next/app';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import React from 'react';
import {
  SDKConfigProvider,
  useSDKConfig,
} from '../providers/sdkconfig-context';
import '../styles/globals.css';
import { Layout } from '../components/layout';
config.autoAddCss = false;

const WithSDKConfig = ({ children }: { children: React.ReactNode }) => {
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskUIProvider
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
          url: 'http://devnext.fakeurl.com',
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
      <SDKConfigProvider>
        <WithSDKConfig>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WithSDKConfig>
      </SDKConfigProvider>
    </SafeAreaProvider>
  );
}
