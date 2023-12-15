import { Meta, Story } from '@storybook/react-native';
import React, { useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Button, { ButtonSize, ButtonVariants } from '../Buttons/Button';
import Toast, { ToastComponentType } from './Toast';
import { TEST_ACCOUNT_ADDRESS, TEST_AVATAR_TYPE } from './Toast.constants';
import { ToastContextWrapper } from './Toast.context';
import { ToastRef, ToastVariants } from './Toast.types';

export default {
  title: 'Component Library / Toast',
  component: Toast,
} as Meta<ToastComponentType>;

const Template: Story<ToastComponentType> = () => {
  const toastRef = useRef<ToastRef>(null);

  return (
    <SafeAreaProvider>
      <ToastContextWrapper>
        <Button
          variant={ButtonVariants.Link}
          size={ButtonSize.Md}
          label={'Show Account Toast'}
          onPress={() => {
            toastRef.current?.showToast({
              variant: ToastVariants.Account,
              labelOptions: [
                { label: 'Switching to' },
                { label: ' Account 2.', isBold: true },
              ],
              accountAddress: TEST_ACCOUNT_ADDRESS,
              accountAvatarType: TEST_AVATAR_TYPE,
            });
          }}
        />
        {/* Additional buttons for other toast examples */}
        <Toast ref={toastRef} />
      </ToastContextWrapper>
    </SafeAreaProvider>
  );
};

export const Default = Template.bind({});
