import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import { useSDKConfig } from '@metamask/sdk-react';
import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Text from '../../design-system/components/Texts/Text';

import Button, {
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';
import { ItemView } from '../item-view/item-view'; // Ensure this is also refactored for React Native

export interface SDKConfigProps {
  showQRCode?: boolean;
}
export const SDKConfig = ({ showQRCode }: SDKConfigProps) => {
  const { socketServer, useDeeplink, lang, infuraAPIKey, setAppContext } =
    useSDKConfig();
  const isProdServer = socketServer === DEFAULT_SERVER_URL;
  const localeUrl =
    typeof window !== 'undefined' ? window.location.href : socketServer;

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
    <View style={{ paddingBottom: 10 }}>
      <ItemView label="Socket Server" value={socketServer} />
      <ItemView label="Infura API Key" value={infuraAPIKey} />
      <ItemView label="Lang" value={lang} />
      <ItemView label="Use DeepLink" value={JSON.stringify(useDeeplink)} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant={ButtonVariants.Secondary}
          label={`Use ${isProdServer ? 'DEV' : 'PROD'} socket server`}
          onPress={updateSocketServer}
        />
        <Button
          variant={ButtonVariants.Secondary}
          label={`Toggle Deeplink`}
          onPress={updateUseDeeplink}
        />
      </View>
      {showQRCode && (
        <View style={{ alignItems: 'center', padding: 10, maxWidth: '100%' }}>
          <QRCode value={localeUrl} size={200} />
          <Text numberOfLines={3}>{localeUrl}</Text>
        </View>
      )}
    </View>
  );
};
