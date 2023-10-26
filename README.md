# MetaMask SDK

[![codecov](https://codecov.io/gh/MetaMask/metamask-sdk/graph/badge.svg?token=6B3Z3724OO)](https://codecov.io/gh/MetaMask/metamask-sdk)

The MetaMask SDK enables developers to easily connect their dapps with a MetaMask wallet (Extension or Mobile) no matter the dapp environment or platform.

The MetaMask SDK is a library that can be installed by developers on their projects and will automatically guide their users to easily connect with a MetaMask wallet client. For instance, for dapps running on a desktop browser, the SDK will check if Extension is installed and if not it will prompt the user to install it or to connect via QR code with their MetaMask Mobile wallet. Another example, for native mobile applications, the SDK will automatically deeplink into MetaMask Mobile wallet to make the connection.

The MetaMask SDK instance returns a [provider](https://docs.metamask.io/wallet/concepts/provider-api/).
This provider is the `ethereum` object that developers are already used to. This provider is available for:

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

## Features

- Session persistence
- Multi MetaMask Provider (Let user choose between browser extension and mobile wallet)
- Chain RPC calls (send multiple requests to your wallet at once)
- Read Only RPC calls and Infura Integration
- Wagmi Hook Integration (alpha)
- i18n
- Full Modal UI customization
- smart contract library ( upcoming )

# Getting Started

The following code examplifies importing the SDK into a javascript-based app. For other languages, check the sections bellow.

Install the SDK:

```bash
yarn add @metamask/sdk
or
npm i @metamask/sdk
```

## Web (d)apps

![](./docs/demo_web.gif)

Follow example on:

- [nextjs demo](./packages/examples/nextjs-demo/README.md)
- [react demo](./packages/examples/create-react-app/README.md)
- [vuejs demo](./packages/examples/vuejs/README.md)
- [pure javascript demo](./packages/examples/pure-javascript/README.md)

## React Native

![](./docs/demo_rn_ios.gif)

We recommend using RN v0.71.4 or higher otherwise you may encounter significant performance issues on Android.

Follow example on:

- [react native demo](./packages/examples/reactNativeDemo/README.md)

## NodeJS

```ts
import { MetaMaskSDK } from '@metamask/sdk';
const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: 'NodeJS example',
  },
});
MMSDK.connect()
  .then((accounts) => {
    console.log('MetaMask SDK is connected', accounts);
    const ethereum = MMSDK.getProvider();
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: accounts,
    });

    console.debug(`account balance`, balance);
  })
  .catch((error) => {
    console.error(error);
  });
```

![](./docs/demo_nodejs.gif)

### Electron

![](./docs/demo_electron.gif)

Follow example on:

- [nodejs example](./packages/examples/nodejs/README.md)
- [electron example](./packages/examples/electronjs/README.md)

## SDK Options

You can find the full interface in [sdk.ts](./packages/sdk/src/sdk.ts) file but here are the useful options:

- `checkInstallationImmediately`: boolean (default: false) - If true, the SDK will check if MetaMask is installed on the user's browser and send a connection request. If not it will prompt the user to install it. If false, the SDK will wait for the `connect` method to be called to check if MetaMask is installed.

- `useDeeplink`: boolean (default: false) - If true, the SDK will use deeplinks to connect with MetaMask Mobile. If false, the SDK will use universal links to connect with MetaMask Mobile.

- `shouldShimWeb3`: boolean (default: false) - If true, the SDK will shim the `window.web3` object with the provider returned by the SDK (useful for compatibility with older browser).

- `infuraAPIKey`: string (default: '') - Infura API key for read-only calls and speed up blockchain interactions. We strongly recommend setting allow-list https://docs.infura.io/networks/ethereum/how-to/secure-a-project/use-an-allowlist as your key would be available to anyone using your dapp.

- `enableDebug`: boolean (default: true) - Send anonymous analytics to MetaMask to help us improve the SDK.

- `modals`: see nodejs example to customize or translate each of the displayed modals.

- `i18nOptions.enabled`: boolean (default: false) - Options for enabling i18n multi-language support on the SDK.

## Contributing

Please see our [contributing guidelines](./docs/contributing.md) for more information.

## Contacts

Contact the MetaMask SDK team for a complimentary design optimization workshop [here](https://fq1an8d8ib2.typeform.com/to/sC7eK5F1)
