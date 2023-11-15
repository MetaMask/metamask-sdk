import React from 'react';
import { SDKConfig, SDKConfigProvider, useSDKConfig } from '@metamask/sdk-lab';
import { MetaMaskProvider } from '@metamask/sdk-react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { First } from '@metamask/sdk-ui';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const WithProvider = () => {
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskProvider
      debug
      sdkOptions={{
        logging: {
          developerMode: true,
        },
        infuraAPIKey,
        communicationServerUrl: socketServer,
        useDeeplink,
        checkInstallationImmediately,
        dappMetadata: {
          name: 'Demo React App',
          url: window.location.host,
        },
        i18nOptions: {
          enabled: true,
        },
      }}
    >
      <SDKConfig
        onHomePress={() => {
          console.debug(`nothing to do here`);
        }}
      />
      <View>
        <Text>Test text</Text>
      </View>
      <First />
      <App />
    </MetaMaskProvider>
  );
};

const WithSDKConfig = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SDKConfigProvider>
        <WithProvider />
      </SDKConfigProvider>
    </SafeAreaProvider>
  );
};

root.render(<WithSDKConfig />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
