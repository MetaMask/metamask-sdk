import { DEFAULT_SERVER_URL } from '@metamask/sdk-communication-layer';
import { useSDKConfig } from '@metamask/sdk-react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  const {
    socketServer,
    useDeeplink,
    lang,
    infuraAPIKey,
    setAppContext,
    reset,
  } = useSDKConfig();

  const isProdServer = socketServer === DEFAULT_SERVER_URL;

  const currentUrl = location.protocol + '//' + location.host;
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

  const onReset = () => {
    reset();
  };

  return (
    <View style={styles.container}>
      <ItemView label="Socket Server" value={socketServer} />
      <ItemView label="Infura API Key" value={infuraAPIKey} />
      <ItemView label="Lang" value={lang} />
      <ItemView label="Use DeepLink" value={JSON.stringify(useDeeplink)} />
      <View style={styles.buttonContainer}>
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
        <Button
          variant={ButtonVariants.Secondary}
          label={`Reset`}
          isDanger={true}
          onPress={onReset}
        />
      </View>
      {showQRCode && (
        <View style={styles.qrCodeContainer}>
          <QRCode value={currentUrl} size={200} />
          <Text>{currentUrl}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    flexWrap: 'wrap',
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 10,
  },
});
