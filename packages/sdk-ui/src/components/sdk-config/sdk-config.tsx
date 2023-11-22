import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import { useSDKConfig } from '@metamask/sdk-react';
import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import Text from '../../design-system/components/Texts/Text';

import { ItemView } from '../item-view/item-view'; // Ensure this is also refactored for React Native

export interface SDKConfigProps {
  showQRCode?: boolean;
}
export const SDKConfig = ({ showQRCode }: SDKConfigProps) => {
  const {
    socketServer,
    useDeeplink,
    lang,
    checkInstallationImmediately,
    infuraAPIKey,
    setAppContext,
  } = useSDKConfig();
  const isProdServer = socketServer === DEFAULT_SERVER_URL;

  const updateSocketServer = () => {
    // TODO let user input the actual server
    const newServer = isProdServer
      ? 'https://socket.siteed.net'
      : DEFAULT_SERVER_URL;
    setAppContext({ socketServer: newServer });
  };

  const updateUseDeeplink = () => {
    setAppContext({ useDeeplink: !useDeeplink });
  };

  return (
    <View>
      <ItemView label="Socket Server" value={socketServer} />
      <ItemView label="Infura API Key" value={infuraAPIKey} />
      <ItemView label="Lang" value={lang} />
      <ItemView label="Use DeepLink" value={JSON.stringify(useDeeplink)} />
      <ItemView
        label="Check Installation Immediately"
        value={JSON.stringify(checkInstallationImmediately)}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <Button mode="outlined" onPress={updateSocketServer}>
          Use {isProdServer ? 'DEV' : 'PROD'} socket server
        </Button>
        <Button mode="outlined" onPress={updateUseDeeplink}>
          Toggle useDeepLink
        </Button>
        <Button mode="outlined" onPress={updateUseDeeplink}>
          Toggle CheckInstallationImmediately
        </Button>
      </View>
      {showQRCode && (
        <View style={{ alignItems: 'center', padding: 10 }}>
          <QRCode value={socketServer} size={200} />
          <Text>{socketServer}</Text>
        </View>
      )}
    </View>
  );
};
