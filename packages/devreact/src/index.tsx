import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const WithProvider = () => {
  return (
    <MetaMaskProvider
      debug
      sdkOptions={{
        logging: {
          developerMode: true,
        },
        communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
        dappMetadata: {
          name: 'Demo React App',
          url: window.location.host,
        },
      }}
    >
      <App />
    </MetaMaskProvider>
  );
};

root.render(<WithProvider />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
