import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Text from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';
import { LanguagePicker } from '../language-picker/language-picker';
import { SDKConfig, SDKConfigProps } from '../sdk-config/sdk-config';
import { usePreferences } from '../../context/preferences-provider';

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
  options?: SDKConfigProps;
  left?: () => React.ReactNode;
  onHomePress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}
export const SDKConfigCard = ({
  startVisible,
  title = 'SDKConfig',
  containerStyle,
  options,
  onHomePress,
}: SDKConfigCardProps) => {
  const { darkMode, toggleDarkMode } = usePreferences();
  const [visible, setVisible] = useState(startVisible ?? false);
  const { colors } = useTheme();

  useEffect(() => {
    setVisible(startVisible ?? false);
  }, [startVisible]);

  const renderIcon = () => {
    return (
      <MaterialIcons
        name={visible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={24}
        color={colors.text.default}
      />
    );
  };

  const renderRight = () => {
    return (
      <View style={styles.centered}>
        <LanguagePicker />
        {/* Add toggle Dark/Light mode button */}
        <IconButton
          icon={darkMode ? 'theme-light-dark' : 'theme-light-dark'}
          onPress={toggleDarkMode}
        />
        <IconButton icon={renderIcon} onPress={() => setVisible(!visible)} />
      </View>
    );
  };

  const renderLeft = () => {
    return <IconButton icon="home" onPress={onHomePress} />;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.alternative },
        containerStyle,
      ]}
    >
      <View style={styles.centered}>
        {renderLeft()}
        <Pressable
          style={styles.titleContainer}
          onPress={() => setVisible((v) => !v)}
        >
          <Text>{title}</Text>
        </Pressable>
        <View>{renderRight()}</View>
      </View>
      {visible && <SDKConfig {...options} />}
    </View>
  );
};
