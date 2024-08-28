# MetaMask React Native SDK Example

This repository provides a comprehensive example of how to set up and run a React Native application using the `MetaMask ReactNative SDK`.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **Yarn** (package manager)
- **JDK 11** (for Android)

The SDK supports communication with MetaMask wallet via deeplinking on iOS. This is the only supported communication mechanism on iOS and needs to be configured for the SDK to work on iOS. To configure your dapp to work with deeplink communication, you need to add a URL scheme in your dapp target's Info setting under URL Types on Xcode. Alternatively, you can add it in your dapp's plist as shown below:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.dubdapp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>dubdapp</string>
        </array>
    </dict>
</array>
```

Additionally, you need to add the following code in your dapp's `AppDelegate.m` file on iOS for the dapp to correctly handle MetaMask deeplinks:

```objc
#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:app openURL:url options:options];
}
```

### Installation

1. **Install dependencies:**

```sh
yarn install
```

2. **Install JDK 11 using Homebrew:**

```sh
brew install openjdk@11
```

3. **Install CocoaPods dependencies:**

```sh
cd ios && pod install
```

### Running the Project

1. **Start the Metro server:**

```sh
yarn start
```

2. **Run on iOS:**

```sh
yarn ios
```

3. **Run on iOS Device:**

```sh
yarn ios:device
```

4. **Run on Android:**

```sh
yarn android
```


### Running the `sdk-react-native` Package Locally and Testing

To run the `sdk-react-native` package locally and test it within the example dApp, follow these steps:

1. **Copy the Package Path:**
   - Right-click on the `sdk-react-native` package folder.
   - Click on "Copy Path" to copy the folder path.

2. **Update the Example dApp:**
   - Open the `package.json` file of your example dApp.
   - Replace the existing reference to `sdk-react-native` with the copied path.
   - The entry in your `package.json` should look something like this:
     ```json
     "@metamask/sdk-react-native": "/Users/{YOUR_MAC_USER_NAME}/Projects/metamask-sdk/packages/sdk-react-native"
     ```

3. **Build and Link the Package:**
   - Open a terminal and navigate to the `sdk-react-native` package folder.
   - Run the following command to build the package and link it to the example dApp:
     ```bash
     yarn build && cd .. && cd examples/reactNativeSdkDemo && rm -rf .yarn && rm -rf node_modules && yarn && cd ios && pod install && cd ..
     ```

4. **Consume the Local Package:**
   - Your example dApp is now consuming the `sdk-react-native` package from the local folder.
   - After making any changes to the `sdk-react-native` package, repeat the above steps to see the updates reflected in the example dApp.

5. **Build and Test:**
   - With the local package linked, you can now build the example dApp and start testing.

---
By following these steps, you ensure that the example dApp is using the latest local version of the `sdk-react-native` package, allowing for seamless development and testing.
