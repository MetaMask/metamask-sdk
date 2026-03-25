# MetaMask SDK React (Deprecated)

> **⚠️ DEPRECATED**
>
> `@metamask/sdk-react` is deprecated and no longer actively maintained. It has been superseded by **MetaMask Connect**, which offers a streamlined API, direct wallet communication (no relay server), and first-class multichain support.
>
> **Migrate to:**
>
> - [`@metamask/connect-evm`](https://www.npmjs.com/package/@metamask/connect-evm) — drop-in EVM dapp integration (browser, Node.js, React Native)
> - [`@metamask/connect-multichain`](https://www.npmjs.com/package/@metamask/connect-multichain) — multichain dapp integration (EVM + non-EVM)
>
> **Migration guide & docs:** <https://docs.metamask.io/metamask-connect>

---

The MetaMask SDK React allows developer an easier integration to the MetaMask SDK on React-based apps.

## Getting Started

Install the SDK:

```
yarn add @metamask/sdk-react
```

Wrap your application in the provider

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MetaMaskProvider } from '@metamask/sdk-react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MetaMaskProvider debug={false} sdkOptions={{
      logging:{
          developerMode: false,
        },
        communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
        checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
        dappMetadata: {
          name: "Demo React App",
          url: window.location.host,
        }
    }}>
      <App />
    </MetaMaskProvider>
  </React.StrictMode>
);
```

Use the SDK in your components:

```js
import { useSDK } from '@metamask/sdk-react';
import React, { useState } from 'react';

export const App = () => {
  const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
    } catch(err) {
      console.warn(`failed to connect..`, err);
    }
  };

  return (
    <div className="App">
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>
          <>
            {chainId && `Connected chain: ${chainId}`}
            <p></p>
            {account && `Connected account: ${account}`}
          </>
        </div>
      )}
    </div>
  );
};
```

Look for more examples at https://github.com/MetaMask/metamask-sdk/tree/main/packages/examples

## Contacts

Contact the MetaMask SDK team for a complimentary design optimization workshop [here](https://fq1an8d8ib2.typeform.com/to/sC7eK5F1)
