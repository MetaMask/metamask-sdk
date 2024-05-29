# MetaMask SDK React Native

The MetaMask SDK React Native allows developers to integrate MetaMask seamlessly into React Native applications.

## Getting Started

### Installation

Install the SDK:

```sh
yarn add @metamask/sdk-react-native
```

### iOS Setup

1. Add the following imports to your `AppDelegate.m`:

```objective-c
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <React/RCTLinkingManager.h>
```

2. Implement the following method in `AppDelegate.m` to handle deep links:

```objective-c
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:app openURL:url options:options];
}
```

3. Add the URL scheme to your Xcode project:

   - Open your project in Xcode.
   - Go to the `Info` tab.
   - Under `URL Types`, click the `+` button to add a new URL type.
   - In the `URL Schemes` field, add your custom scheme (e.g., `yourappscheme`).

4. Update your `Podfile` to include the following lines:
```ruby
# This is required in order to install the "metamask-ios-sdk" pod
use_frameworks!
pod 'metamask-ios-sdk', :git => 'https://github.com/MetaMask/metamask-ios-sdk.git'
```

4. Install CocoaPods dependencies:

```sh
cd ios && pod install
```

### Wrap Your Application in the Provider

```js
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { MetaMaskProvider } from '@metamask/sdk-react-native';

const sdkOptions = {
  dappMetadata: {
    name: 'Demo React Native App',
    url: 'https://yourdapp.com',
    iconUrl: 'https://yourdapp.com/icon.png',
    scheme: 'yourappscheme',
  },
  infuraAPIKey: 'YOUR_INFURA_API_KEY', // Optional
};

const Root = () => (
  <MetaMaskProvider sdkOptions={sdkOptions}>
    <App />
  </MetaMaskProvider>
);

AppRegistry.registerComponent('YourAppName', () => Root);
```

### Use the SDK in Your Components

```js
import { useSDK } from '@metamask/sdk-react-native';
import React from 'react';
import { View, Button, Text } from 'react-native';

const App = () => {
  const { sdk, connected, connecting, provider, chainId, account } = useSDK();

  const connect = async () => {
    try {
      await sdk?.connect();
    } catch (err) {
      console.warn('Failed to connect..', err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Connect" onPress={connect} disabled={connecting} />
      {connected && (
        <View>
          {chainId && <Text>Connected chain: {chainId}</Text>}
          {account && <Text>Connected account: {account}</Text>}
        </View>
      )}
    </View>
  );
};

export default App;
```

### SDK Options

| Option                 | Type   | Description                             | Mandatory |
| ---------------------- | ------ | --------------------------------------- | --------- |
| `dappMetadata.name`    | string | Name of your dApp                       | Yes       |
| `dappMetadata.url`     | string | URL of your dApp                        | Yes       |
| `dappMetadata.iconUrl` | string | URL of the icon of your dApp            | No        |
| `dappMetadata.scheme`  | string | Custom scheme for your React Native app | Yes       |
| `infuraAPIKey`         | string | Your Infura API key                     | No        |

### SDK Methods

- `connect()`: Connect to MetaMask.
- `connectAndSign({ msg })`: Connect to MetaMask and sign a message.
- `connectWith(req)`: Connect to MetaMask with a specific request.
- `terminate()`: Terminate the MetaMask connection.

### Provider Methods

- `request(req)`: Make a request to MetaMask.
- `batchRequest(requests)`: Make batch requests to MetaMask.
- `getChainId()`: Get the current chain ID.
- `getSelectedAddress()`: Get the selected address.

### Example

Refer to the [example folder](https://github.com/MetaMask/metamask-sdk/tree/main/packages/examples) for more info on how to use the SDK.

## Contacts

For additional support, open an issue on our [GitHub repository](https://github.com/MetaMask/metamask-sdk/issues).
