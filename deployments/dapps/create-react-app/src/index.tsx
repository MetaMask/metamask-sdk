import { MetaMaskProvider } from '@metamask/sdk-react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { SDKConfigProvider, useSDKConfig } from './providers/sdkconfig-context';
import { Layout } from './components/layout';
import { Demo } from './pages/demo';
import { Onboard } from './pages/onboard';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const WithSDKProvider = ({ children }: { children: React.ReactNode }) => {
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
          url: 'http://devnext.fakeurl.com',
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <WithSDKProvider>
      <App />
    </WithSDKProvider>
  },
  {
    path: "/demo",
    element: <WithSDKProvider>
      <Demo />
    </WithSDKProvider>
  },
  {
    path: "/onboard",
    element: <Onboard />
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <>
    <SDKConfigProvider>
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </SDKConfigProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
