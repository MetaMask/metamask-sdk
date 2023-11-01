import { MetaMaskProvider } from '@metamask/sdk-react';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import App from './App';
import { Modal } from './Modal';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { updateQrCode } from './helpers';

const root = ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        logging: {
          developerMode: false,
        },
        communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
        checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
        i18nOptions: {
          enabled: true,
        },
        dappMetadata: {
          name: 'Demo React App',
          url: window.location.host,
        },
        modals: {
          install: ({ link }) => {
            let modalContainer: HTMLElement | null;

            return {
              mount: () => {
                modalContainer = document.createElement('div');

                modalContainer.id = 'meta-mask-modal-container';

                document.body.appendChild(modalContainer);

                ReactDOM.render(
                  <Modal
                    onClose={() => {
                      ReactDOM.unmountComponentAtNode(modalContainer);
                      modalContainer.remove();
                    }}
                  />,
                  modalContainer,
                );

                setTimeout(() => {
                  updateQrCode(link);
                }, 100);
              },
              unmount: () => {
                if (modalContainer) {
                  ReactDOM.unmountComponentAtNode(modalContainer);

                  modalContainer.remove();
                }
              },
            };
          },
        },
      }}
    >
      <App />
    </MetaMaskProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
