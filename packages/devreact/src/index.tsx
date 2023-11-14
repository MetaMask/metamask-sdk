import React from 'react';
import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const WithProvider = () => {
  const handleClick = () => {
    console.log('click');
  };
  // return (
  //   <MetaMaskProvider
  //     debug
  //     sdkOptions={{
  //       logging: {
  //         developerMode: true,
  //       },
  //       communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
  //       dappMetadata: {
  //         name: 'Demo React App',
  //         url: window.location.host,
  //       },
  //     }}
  //   >
  //     <div>
  //       ok: {DEFAULT_SERVER_URL}
  //       <div>
  //         <button onClick={handleClick}>test</button>
  //       </div>
  //       <App />
  //     </div>
  //   </MetaMaskProvider>
  // );
  return <>ok</>;
};

root.render(<WithProvider />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
