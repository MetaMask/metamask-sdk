// Third party dependencies.
import React, { forwardRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

// External dependencies.
import { formatAddress } from '../../../../utils/address';
import { useStyles } from '../../../hooks';
import Avatar, { AvatarSize, AvatarVariant } from '../../Avatars/Avatar';
import Text, { TextVariant } from '../../Texts/Text';

// Internal dependencies.
import PickerBase from '../PickerBase';
import styleSheet from './PickerAccount.styles';
import { PickerAccountProps } from './PickerAccount.types';
import { useTranslation } from 'react-i18next';

const PickerAccount: React.ForwardRefRenderFunction<
  TouchableOpacity,
  PickerAccountProps
> = (
  {
    style,
    accountAddress,
    accountName,
    accountAvatarType,
    accountTypeLabel,
    showAddress = true,
    cellAccountContainerStyle = {},
    ...props
  },
  ref,
) => {
  const { t: strings } = useTranslation();
  const { styles } = useStyles(styleSheet, {
    style,
    cellAccountContainerStyle,
  });
  const shortenedAddress = formatAddress(accountAddress, 'short');

  const renderCellAccount = () => (
    <View style={styles.cellAccount}>
      <Avatar
        variant={AvatarVariant.Account}
        type={accountAvatarType}
        accountAddress={accountAddress}
        size={AvatarSize.Md}
        style={styles.accountAvatar}
      />
      <View style={styles.accountNameLabel}>
        <Text variant={TextVariant.HeadingSMRegular}>{accountName}</Text>
        {accountTypeLabel && (
          <Text
            variant={TextVariant.BodySM}
            style={styles.accountNameLabelText}
          >
            {strings(accountTypeLabel)}
          </Text>
        )}
        {showAddress && (
          <Text variant={TextVariant.BodyMD} style={styles.accountAddressLabel}>
            {shortenedAddress}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <PickerBase style={styles.base} {...props} ref={ref}>
      {renderCellAccount()}
    </PickerBase>
  );
};

export default forwardRef(PickerAccount);
