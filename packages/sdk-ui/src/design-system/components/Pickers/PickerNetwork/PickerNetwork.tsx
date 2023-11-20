// Third party dependencies.
import React from 'react';
import { TouchableOpacity } from 'react-native';

// External dependencies.
import { useStyles } from '../../../hooks';
import Avatar, { AvatarSize, AvatarVariant } from '../../Avatars/Avatar';
import Icon, { IconName, IconSize } from '../../Icons/Icon';
import Text, { TextVariant } from '../../Texts/Text';

// Internal dependencies.
import { PICKERNETWORK_ARROW_TESTID } from './PickerNetwork.constants';
import stylesheet from './PickerNetwork.styles';
import { PickerNetworkProps } from './PickerNetwork.types';

const PickerNetwork = ({
  onPress,
  style,
  label,
  imageSource,
  ...props
}: PickerNetworkProps) => {
  const { styles } = useStyles(stylesheet, { style });

  return (
    <TouchableOpacity style={styles.base} onPress={onPress} {...props}>
      <Avatar
        variant={AvatarVariant.Network}
        size={AvatarSize.Xs}
        name={label}
        imageSource={imageSource}
      />
      <Text style={styles.label} numberOfLines={1} variant={TextVariant.BodyMD}>
        {label}
      </Text>
      {onPress && (
        <Icon
          size={IconSize.Xs}
          name={IconName.ArrowDown}
          testID={PICKERNETWORK_ARROW_TESTID}
        />
      )}
    </TouchableOpacity>
  );
};

export default PickerNetwork;
