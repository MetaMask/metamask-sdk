import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Text from '../../design-system/components/Texts/Text';
import { LanguagePicker } from '../language-picker/language-picker';
import { SDKConfig } from '../sdk-config/sdk-config';

const styles = StyleSheet.create({
  container: {},
  centered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flex: 1, alignContent: 'center', alignItems: 'center' },
});

export interface SDKConfigCardProps {
  startVisible?: boolean;
  title?: string;
  left?: () => React.ReactNode;
  onHomePress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}
export const SDKConfigCard = ({
  startVisible,
  title = 'SDKConfig',
  containerStyle,
  onHomePress,
}: SDKConfigCardProps) => {
  const [visible, setVisible] = useState(startVisible ?? false);

  useEffect(() => {
    setVisible(startVisible ?? false);
  }, [startVisible]);

  const renderIcon = () => {
    return (
      <MaterialIcons
        name={visible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={24}
        color="black"
      />
    );
  };

  const renderRight = () => {
    return (
      <View style={styles.centered}>
        <LanguagePicker />
        <IconButton icon={renderIcon} onPress={() => setVisible(!visible)} />
      </View>
    );
  };

  const renderLeft = () => {
    return <IconButton icon="home" onPress={onHomePress} />;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.centered}>
        {renderLeft()}
        <View style={styles.titleContainer}>
          <Text>{title}</Text>
        </View>
        <View>{renderRight()}</View>
      </View>
      {visible && <SDKConfig />}
    </View>
  );
};
