# MetaMask SDK React UI (Deprecated)

> **⚠️ DEPRECATED**
>
> `@metamask/sdk-react-ui` is deprecated and no longer actively maintained. It has been superseded by **MetaMask Connect**, which offers a streamlined API, direct wallet communication (no relay server), and first-class multichain support.
>
> **Migrate to:**
>
> - [`@metamask/connect-evm`](https://www.npmjs.com/package/@metamask/connect-evm) — drop-in EVM dapp integration (browser, Node.js, React Native)
> - [`@metamask/connect-multichain`](https://www.npmjs.com/package/@metamask/connect-multichain) — multichain dapp integration (EVM + non-EVM)
>
> **Migration guide & docs:** <https://docs.metamask.io/metamask-connect>

---

The MetaMask SDK React UI allows developer an easier integration to the MetaMask SDK on React-based apps.
On top of exporting the hooks from `@metamask/sdk-react`, it also provides wrapper around wagmi hooks and a basic UI button component to connect to MetaMask.

## Getting Started

Install the ui sdk package:

```
yarn add @metamask/sdk-react-ui
```

Wrap your application in the provider

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <MetaMaskUIProvider sdkOptions={{
      dappMetadata: {
        name: "Demo UI React App",
      }
    }}>
      <App />
    </MetaMaskUIProvider>
  </React.StrictMode>
);
```

Use the SDK in your components:

```js
import { MetaMaskButton } from '@metamask/sdk-react-ui';
import React, { useState } from 'react';

export const App = () => {
  return (
    <div className="App">
      <MetaMaskButton theme={'light'} color="white"></MetaMaskButton>
    </div>
  );
};
```

Look for more examples at https://github.com/MetaMask/metamask-sdk/tree/main/packages/examples

## Contacts

Contact the MetaMask SDK team for a complimentary design optimization workshop [here](https://fq1an8d8ib2.typeform.com/to/sC7eK5F1)
