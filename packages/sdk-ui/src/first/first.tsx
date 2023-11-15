import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useSDK } from '@metamask/sdk-react';

import React from 'react';

export const First = () => {
  const { account } = useSDK();
  return (
    <View>
      <Text>Testing cross-platform component to validate the library</Text>
      <Text>account: {account}</Text>
      <Button
        mode="outlined"
        onPress={() => {
          console.log(`ok I was pressed`);
        }}
      >
        test
      </Button>
      <Text>hello</Text>
    </View>
  );
};
