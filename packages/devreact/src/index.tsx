import {
  FloatingMetaMaskButton,
  MetaMaskProvider,
  SDKConfigProvider,
  SDKConfigCard,
  UIProvider,
  useSDKConfig,
} from '@metamask/sdk-ui';
import React from 'react';
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

const WithUI = ({ children }: { children: React.ReactNode }) => {
  return <UIProvider>{children}</UIProvider>;
};

const WithSDKConfig = ({ children }: { children: React.ReactNode }) => {
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    debug,
    checkInstallationImmediately,
  } = useSDKConfig();

  return (
    <MetaMaskProvider
      debug={debug}
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
      {children}
    </MetaMaskProvider>
  );
};

root.render(
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <SDKConfigProvider
      initialSocketServer={process.env.REACT_APP_COMM_SERVER_URL}
      initialInfuraKey={process.env.INFURA_API_KEY}
    >
      <WithSDKConfig>
        <WithUI>
          <SDKConfigCard
            onHomePress={() => {
              console.debug(`nothing to do here`);
            }}
          />
          <App />
          <FloatingMetaMaskButton distance={{ bottom: 40 }} />
        </WithUI>
      </WithSDKConfig>
    </SDKConfigProvider>
  </SafeAreaProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
