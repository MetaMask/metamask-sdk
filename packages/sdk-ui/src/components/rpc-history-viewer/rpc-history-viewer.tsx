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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Text from '../../design-system/components/Texts/Text';
import { useTheme } from '../../theme';
import { HistoryItem } from './history-item/history-item';

const getStyles = ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      borderColor: theme.colors.border.default,
      position: Platform.OS === 'web' ? 'fixed' : ('absolute' as any),
      bottom: 0,
      right: 0,
      flex: 1,
      left: 0,
      backgroundColor: theme.colors.background.alternative,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
    button: {
      padding: 5,
      backgroundColor: '#e7e7e7',
      borderRadius: 4,
    },
    historyView: {
      maxHeight: 300,
      backgroundColor: 'white',
      borderColor: '#eaeaea',
    },
    listItem: {
      backgroundColor: theme.colors.background.default,
      borderBottomColor: '#ddd',
      borderBottomWidth: 1,
      padding: 10,
    },
  });

export interface RPCHistoryViewerProps {
  startVisible?: boolean;
}

export const RPCHistoryViewer = ({ startVisible }: RPCHistoryViewerProps) => {
  const { rpcHistory, extensionActive } = useSDK();
  const [visible, setVisible] = React.useState(startVisible ?? false);
  const theme = useTheme();
  const styles = useMemo(() => getStyles({ theme }), [theme]);

  const sortedRpcHistory = React.useMemo(() => {
    const historyArray = Object.values(rpcHistory ?? {});
    return historyArray.sort((a, b) => b.timestamp - a.timestamp);
  }, [rpcHistory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {extensionActive ? (
          <Text>No RPC History for browser extension</Text>
        ) : (
          <Pressable
            onPress={() => setVisible(!visible)}
            style={{ flexGrow: 1 }}
          >
            <Text>RPC History [{sortedRpcHistory.length}]</Text>
          </Pressable>
        )}
        {!extensionActive && (
          <MaterialIcons
            name={visible ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={24}
            onPress={() => setVisible(!visible)}
            color={theme.colors.text.default}
          />
        )}
      </View>

      {visible && (
        <ScrollView style={styles.historyView}>
          {sortedRpcHistory?.length === 0 && <Text>No RPC history</Text>}
          {sortedRpcHistory.map((entry, index) => (
            <View key={index} style={styles.listItem}>
              <HistoryItem entry={entry} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
