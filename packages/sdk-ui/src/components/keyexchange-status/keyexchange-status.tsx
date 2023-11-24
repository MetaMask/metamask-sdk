import { Theme } from '@metamask/design-tokens';
import { useSDK } from '@metamask/sdk-react';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Text from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';

const getStyles = ({
  theme,
  bottom,
  left,
}: {
  theme: Theme;
  bottom: number;
  left: number;
}) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.default,
      padding: 8,
      position: Platform.OS === 'web' ? 'fixed' : ('absolute' as any),
      bottom,
      maxWidth: '100%',
      width: 200,
      maxHeight: 300,
      borderWidth: 1,
      left,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.alternative,
      gap: 10,
    },
    viewRow: {
      display: 'flex',
      // justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  });

export interface KeyExchangeStatusProps {
  bottom?: number;
  left?: number;
}

export const KeyExchangeStatus = ({
  bottom = 0,
  left = 0,
}: KeyExchangeStatusProps) => {
  const { status, syncing } = useSDK();
  const [visible, setVisible] = React.useState(true);
  const theme = useTheme();
  const styles = useMemo(
    () => getStyles({ theme, bottom, left }),
    [theme, bottom, left],
  );

  const renderIcon = () => {
    return (
      <MaterialIcons
        name={visible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
        size={16}
        color={theme.colors.text.default}
      />
    );
  };

  return (
    <View style={[styles.container]}>
      <Pressable
        style={styles.headerContainer}
        onPress={() => setVisible((v) => !v)}
      >
        <Text style={{ flex: 1, paddingLeft: 5 }}>Status</Text>
        {syncing && <ActivityIndicator size="small" />}
        <IconButton icon={renderIcon} onPress={() => setVisible(!visible)} />
      </Pressable>
      {visible && (
        <ScrollView>
          <View style={styles.viewRow}>
            <Text>Connection:</Text>
            <Text>{status?.connectionStatus?.toString()}</Text>
          </View>
          <View style={styles.viewRow}>
            <Text>KeysExchanged:</Text>
            <Text
              style={{
                color: status?.keyInfo?.keysExchanged
                  ? theme.colors.primary.default
                  : theme.colors.warning.default,
              }}
            >
              {status?.keyInfo?.keysExchanged.toString()}
            </Text>
          </View>
          <View style={styles.viewRow}>
            <Text>Step:</Text>
            <Text>{status?.keyInfo?.step.toString()}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};
