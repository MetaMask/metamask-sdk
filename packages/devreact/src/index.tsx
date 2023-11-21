import React from 'react';
import { SDKConfig } from '@metamask/sdk-lab';
import {
  MetaMaskProvider,
  SDKConfigProvider,
  useSDKConfig,
} from '@metamask/sdk-react';
import { UIProvider } from '@metamask/sdk-ui';
import ReactDOM from 'react-dom/client';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { App } from './App';
import './icons.css';
import './index.css';
import reportWebVitals from './reportWebVitals';

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
          url: window.location.protocol + '//' + window.location.host,
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
      {/* <PreviewScreen /> */}
      <App />
    </MetaMaskProvider>
  );
};

const WithSDKConfig = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SDKConfigProvider>
        <UIProvider>
          <WithProvider />
        </UIProvider>
      </SDKConfigProvider>
    </SafeAreaProvider>
  );
};

root.render(<WithSDKConfig />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
