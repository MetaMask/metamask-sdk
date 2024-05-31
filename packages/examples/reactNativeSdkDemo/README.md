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
