import { View, Text } from 'react-native';
import { useSDK } from '@metamask/sdk-react';

import React, { useContext } from 'react';
import Button, {
  ButtonVariants,
} from '../../design-system/components/Buttons/Button';
import {
  ToastContext,
  ToastVariants,
} from '../../design-system/components/Toast';
import { TEST_AVATAR_TYPE } from '../../design-system/components/Toast/Toast.constants';

export const First = () => {
  const allSDK = useSDK();
  const { toastRef } = useContext(ToastContext);

  return (
    <View>
      <Text>account: {allSDK.account}</Text>
      <Button
        label="test"
        variant={ButtonVariants.Primary}
        onPress={() => {
          console.log(`ok I was pressed`, toastRef);
          toastRef?.current?.showToast({
            variant: ToastVariants.Account,
            labelOptions: [
              { label: 'Switching to' },
              { label: ' Account 2.', isBold: true },
            ],
            accountAddress: 'asdfadsfasdf',
            accountAvatarType: TEST_AVATAR_TYPE,
          });
        }}
      />
      <Text>hello</Text>
    </View>
  );
};
