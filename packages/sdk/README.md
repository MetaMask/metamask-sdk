# MetaMask SDK

The MetaMask SDK enables developers to easily connect their dapps with a MetaMask wallet (Extension or Mobile) no matter the dapp environment or platform.

The MetaMask SDK is a library that can be installed by developers on their projects and will automatically guide their users to easily connect with a MetaMask wallet client. For instance, for dapps running on a desktop browser, the SDK will check if Extension is installed and if not it will prompt the user to install it or to connect via QR code with their MetaMask Mobile wallet. Another example, for native mobile applications, the SDK will automatically deeplink into MetaMask Mobile wallet to make the connection.

The MetaMask SDK instance returns a provider, this provider is the `ethereum` object that developers are already used to which is [here](https://docs.metamask.io/guide/ethereum-provider.html). This provider will now be available for:

- [Javascript-based apps](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-js.html#javascript)
  - [Web (d)apps](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-js.html#web-d-apps)
  - [React Native](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-js.html#react-native)
  - [Electron](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-js.html#electron)
  - [NodeJS](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-js.html#nodejs)
- [Gaming](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-gaming.html#gaming)
  - [Unity](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-gaming.html#unity)
  - [Unreal Engine](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-gaming.html#unreal-engine)
- [Mobile Native Apps](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-mobile.html#mobile)
  - [Android](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-mobile.html#android)
  - [iOS](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-mobile.html#ios)

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

# Follow the full documentation

[Please access this to read the MetaMask SDK full documentation](https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/guide/metamask-sdk-intro.html)
