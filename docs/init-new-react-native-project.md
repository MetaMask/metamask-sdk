### Initializing a New React Native Project with MetaMask SDK

1. **Create a new React Native (RN) project:**

   ```bash
   npx react-native@latest init AwesomeProject
   ```

2. **Integrate MetaMask SDK:**

   Install required packages:

   ```bash
   npm install eciesjs @metamask/sdk-react ethers@5.7.2 @react-native-async-storage/async-storage node-libs-react-native react-native-background-timer react-native-randombytes react-native-url-polyfill react-native-get-random-values
   ```

   Update your Metro config file (`metro.config.js`) to include the necessary resolver configuration:

   ```javascript
   // metro.config.js for React Native
   const {
     getDefaultConfig,
     mergeConfig,
   } = require('@react-native/metro-config');

   const defaultConfig = getDefaultConfig(__dirname);

   const config = {
     transformer: {
       getTransformOptions: async () => ({
         transform: {
           experimentalImportSupport: false,
           inlineRequires: true,
         },
       }),
     },
     resolver: {
       extraNodeModules: {
         ...require('node-libs-react-native'),
       },
     },
   };

   module.exports = mergeConfig(defaultConfig, config);
   ```

   In your entry file (e.g., `index.js` or `App.tsx`), include the following shims and ethers library:

   ```javascript
   // index.js or App.tsx
   import 'node-libs-react-native/globals';
   import 'react-native-url-polyfill/auto';
   import 'react-native-get-random-values';
   ```

   ## Now you can run the project

   ```bash
   npx react-native run-android

   npx react-native run-ios
   ```

### Notes

- For a more in-depth guide on initializing and using the MetaMask SDK in a React Native project, refer to the `reactNativeDemo` example app located in the `/examples` folder.
