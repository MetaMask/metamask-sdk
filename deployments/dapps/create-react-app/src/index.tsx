import {
  FloatingMetaMaskButton,
  MetaMaskProvider,
  SDKConfigCard,
  SDKConfigProvider,
  UIProvider,
  useSDKConfig,
} from '@metamask/sdk-ui';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Demo } from './pages/demo';
import { Onboard } from './pages/onboard';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <App />
        <FloatingMetaMaskButton distance={{ bottom: 40 }} />
      </>
    ),
  },
  {
    path: '/demo',
    element: (
      <>
        <Demo />
        <FloatingMetaMaskButton distance={{ bottom: 40 }} />
      </>
    ),
  },
  {
    path: '/onboard',
    element: <Onboard />,
  },
]);

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
          developerMode: debug,
        },
        infuraAPIKey,
        communicationServerUrl: socketServer,
        useDeeplink,
        checkInstallationImmediately,
        dappMetadata: {
          name: 'DemoDapp ',
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <SDKConfigProvider
      initialSocketServer={process.env.REACT_APP_COMM_SERVER_URL}
      initialInfuraKey={process.env.INFURA_API_KEY}
    >
      <WithSDKConfig>
        <UIProvider>
          <SDKConfigCard
            onHomePress={() => {
              router.navigate('/');
            }}
          />
          <RouterProvider router={router} />
        </UIProvider>
      </WithSDKConfig>
    </SDKConfigProvider>
  </SafeAreaProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
