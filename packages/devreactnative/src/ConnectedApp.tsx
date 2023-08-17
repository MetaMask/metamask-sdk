// import {MetaMaskProvider} from '@metamask/sdk-react';
import React from 'react';
import {Linking, LogBox} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import App from './App';
import { Plop } from './Plop';
import {MetaMaskProvider} from './MetaMaskProvider';

// TODO how to properly make sure we only try to open link when the app is active?
// current problem is that sdk declaration is outside of the react scope so I cannot directly verify the state
// hence usage of a global variable.
let canOpenLink = true;

LogBox.ignoreLogs([
  "MetaMask: 'ethereum._metamask' exposes non-standard, experimental methods",
]); // Ignore log notification by message

export const ConnectedApp = () => {
  return (
    <MetaMaskProvider
      debug={true}
      sdkOptions={{
        communicationServerUrl: 'http://192.168.50.114:4000',
        logging: {
          developerMode: true,
          sdk: true,
          remoteLayer: false,
          serviceLayer: false,
          plaintext: true,
        },
        openDeeplink: (link: string) => {
          if (canOpenLink) {
            console.debug(`App::openDeepLink() ${link}`);
            Linking.openURL(link);
          } else {
            console.debug(
              'useBlockchainProiver::openDeepLink app is not active - skip link',
              link,
            );
          }
        },
        timer: BackgroundTimer,
        checkInstallationImmediately: false,
        storage: {
          enabled: true,
        },
        dappMetadata: {
          name: 'DevReactNative',
        },
      }}>
      {/* <App /> */}
      <Plop />
      {/* <Text>test</Text> */}
    </MetaMaskProvider>
  );
};
