# MetaMask SDK

The MetaMask SDK enables developers to easily connect their dapps with a MetaMask wallet (Extension or Mobile) no matter the dapp environment or platform.

Although users can straightforwardly access dapps within a desktop browser with MetaMask Extension installed and can also straightforwardly access dapps within our in-app browser inside MetaMask Mobile, it has been historically harder for native mobile apps, native desktop apps, games, and even web apps on mobile browsers to connect with a MetaMask wallet.

The MetaMask SDK is a library that can be installed by developers on their projects and will automatically guide their users to easily connect with a MetaMask wallet client. For instance, for dapps running on a desktop browser, the SDK will check if Extension is installed and if not it will prompt the user to install it or to connect via QR code with their MetaMask Mobile wallet. Another example, for native mobile applications, the SDK will automatically deeplink into MetaMask Mobile wallet to make the connection.

The MetaMask SDK instance returns a provider, this provider is the ```ethererum``` object that developers are already used to which is [here](https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents). This provider will now be available for:
- [Javascript-based apps](#javascript-based-apps)
  - [Web (d)apps](#web)
  - [React Native](#react-native)
  - [Electron](#electron)
  - [NodeJS](#nodejs)
- [Games](#games) 
  - [Unity](#unity)
  - [Unreal Engine](#unreal-engine)
- [Mobile Native Apps](#mobile)
  - [Android](#android)
  - [iOS](#ios)

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

## Javascript-based apps
### Web

### React Native

### Electron

### NodeJS

## Games
### Unity
### Unreal Engine
Coming soon

## Mobile
### Android
Coming soon
### iOS
Coming soon
### React Native
Check [here](#react-native)

# Concepts
