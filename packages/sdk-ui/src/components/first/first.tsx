import { View, Text } from 'react-native';
import { useSDK } from '@metamask/sdk-react';

import React from 'react';
import Button, {
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';

export const First = () => {
  const { account } = useSDK();
  return (
    <View>
      <Text>account: {account}</Text>
      <Button
        label="test"
        variant={ButtonVariants.Primary}
        onPress={() => {
          console.log(`ok I was pressed`);
        }}
      />
      <Text>hello</Text>
    </View>
  );
};
