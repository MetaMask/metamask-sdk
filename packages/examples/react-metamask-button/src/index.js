import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MetaMaskProvider } from '@metamask/sdk-react';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MetaMaskProvider sdkOptions={{
        // communicationServerUrl: 'http://192.168.50.114:4000/',
        dappMetadata: {
          name: 'React Demo Button',
          url: 'http://reactdemobutton.localhost'
        },
        autoConnect: {
          enable: true
        },
        storage: {
          enabled: true
        }
      }}>
      <App />
    </MetaMaskProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
