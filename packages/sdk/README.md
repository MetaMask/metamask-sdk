# MetaMask SDK

The MetaMask SDK enables developers to easily connect their dapps with a MetaMask wallet (Extension or Mobile) no matter the dapp environment or platform.

The MetaMask SDK is a library that can be installed by developers on their projects and will automatically guide their users to easily connect with a MetaMask wallet client. For instance, for dapps running on a desktop browser, the SDK will check if Extension is installed and if not it will prompt the user to install it or to connect via QR code with their MetaMask Mobile wallet. Another example, for native mobile applications, the SDK will automatically deeplink into MetaMask Mobile wallet to make the connection.

The MetaMask SDK instance returns a provider, this provider is the `ethereum` object that developers are already used to which is [here](https://docs.metamask.io/guide/ethereum-provider.html). This provider will now be available for:

- [Javascript-based apps](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/)
  - [React](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/react/)
  - [Pure JavaScript](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/pure-js/)
  - [Other web frameworks](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/other-web-frameworks/)
  - [React Native](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/react-native/)
  - [NodeJS](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/nodejs/)
  - [Electron](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/javascript/electron/)
- [Gaming apps](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/gaming/)
  - [Unity](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/gaming/unity/)
  - [Unreal Engine](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/gaming/unreal-engine/) (coming soon)
- [Mobile Native apps](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/mobile/)
  - [iOS](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/mobile/ios/)
  - [Android](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/mobile/android/)

# Getting Started

The following code examplifies importing the SDK into a javascript-based app. For other languages, check the sections bellow.

Install the SDK:

```
yarn add @metamask/sdk
or
npm i @metamask/sdk
```

Import the SDK (for possible parameters check this):

```
import MetaMaskSDK from '@metamask/sdk'
const ethereum = new MetaMaskSDK({})
```

Use the SDK:

```
ethereum.request({method: 'eth_requestAccounts', params: []})
```

# Bundle Types

The MetaMask SDK provides different bundles optimized for various environments:

## Browser Bundle

- **Usage**: For web applications running in browsers
- **Import Path**: `@metamask/sdk/browser`
- **Format**: ES Modules
- **Example**:

```javascript
import MetaMaskSDK from '@metamask/sdk/browser';
```

## React Native Bundle

- **Usage**: For React Native mobile applications
- **Import Path**: `@metamask/sdk/react-native`
- **Format**: ES Modules
- **Example**:

```javascript
import MetaMaskSDK from '@metamask/sdk/react-native';
```

## Node.js Bundle

- **Usage**: For Node.js server-side applications
- **Import Path**: `@metamask/sdk/node`
- **Formats**: Both CommonJS (require) and ES Modules (import)
- **Example**:

```javascript
// ESM
import MetaMaskSDK from '@metamask/sdk/node';

// CommonJS
const MetaMaskSDK = require('@metamask/sdk/node');
```

The SDK will automatically select the appropriate bundle based on your environment, but you can explicitly choose a specific bundle using the paths above.

# Follow the full documentation

[Please access this to read the MetaMask SDK full documentation](https://docs.metamask.io/wallet/how-to/connect/set-up-sdk/)

## Contacts

Contact the MetaMask SDK team for a complimentary design optimization workshop [here](https://fq1an8d8ib2.typeform.com/to/sC7eK5F1)
