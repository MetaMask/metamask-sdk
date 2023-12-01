### Initializing a New Expo Project with MetaMask SDK

1. **Create a new Expo project:**

   ```bash
   npx create-expo-app devexpo --template
   ```

2. **Integrate MetaMask SDK:**

   Install required packages:

   ```bash
   # Install necessary dependencies
   npx expo install expo-crypto @metamask/sdk-react ethers@5.7.2 @react-native-async-storage/async-storage node-libs-expo react-native-background-timer react-native-randombytes react-native-url-polyfill react-native-get-random-values@1.8.0
   ```

   ## Creare default metro config file

   ```
   npx expo customize metro.config.js
   ```

   This will create a new default Metro config file (`metro.config.js`) and you need to change it to look like that:

   ```javascript
   // metro.config.js for Expo
   const config = getDefaultConfig(__dirname);

   config.resolver.extraNodeModules = {
     ...require('node-libs-expo'),
   };

   config.transformer.getTransformOptions = async () => ({
     transform: {
       experimentalImportSupport: false,
       inlineRequires: true,
     },
   });

   module.exports = config;
   ```

   Now add polyfills to the top of your entry file (`App.tsx`):

   ```javascript
   // App.tsx
   import 'node-libs-expo/globals';
   import 'react-native-url-polyfill/auto';
   import 'react-native-get-random-values';
   ```

   ## Prebuild the project:

   ```bash
   npx expo prebuild
   ```

   ## Now you can run the project

   ```
     npx expo run:android

     npx expo run:ios
   ```

### Notes

- For a more in-depth guide on initializing and using the MetaMask SDK in an Expo app, refer to the `expo-demo` example app located in the `/examples` folder.
- The example provides practical insights into integrating and utilizing the MetaMask SDK within an Expo app, serving as a valuable reference.
