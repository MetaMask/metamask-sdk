import { MetaMaskProvider } from '@metamask/sdk-react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { SDKConfigProvider, useSDKConfig } from './providers/sdkconfig-context';
import { Layout } from './components/layout';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

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

root.render(
  <>
    <SDKConfigProvider>
      <WithSDKConfig>
        <Layout>
          <App />
        </Layout>
      </WithSDKConfig>
    </SDKConfigProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
