import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { MetaMaskProvider } from '@metamask/sdk-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MetaMaskProvider debug={false} sdkOptions={{
        logging: {
          developerMode: false,
        },
        checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
        i18nOptions: {
          enabled: true,
        },
        dappMetadata: {
          name: 'Demo Vite React App',
          url: window.location.protocol + '//' + window.location.host,
        },
      }}
    >
      <App />
    </MetaMaskProvider>
  </StrictMode>,
);
