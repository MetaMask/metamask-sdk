import React from 'react';
import PickerNetworkComponent from './PickerNetwork';
import { SAMPLE_PICKERNETWORK_PROPS } from './PickerNetwork.constants';
import { Meta, Story } from '@storybook/react-native';
import { PickerNetworkProps } from './PickerNetwork.types';

export default {
  title: 'Component Library / Pickers / PickerNetwork',
  component: PickerNetworkComponent,
  argTypes: {
    label: {
      control: { type: 'text' },
      defaultValue: SAMPLE_PICKERNETWORK_PROPS.label,
    },
    // Add other argTypes if necessary
  },
} as Meta<PickerNetworkProps>;

const Template: Story<PickerNetworkProps> = (args) => (
  <PickerNetworkComponent
    {...args}
    imageSource={SAMPLE_PICKERNETWORK_PROPS.imageSource}
    onPress={SAMPLE_PICKERNETWORK_PROPS.onPress}
  />
);

export const PickerNetwork = Template.bind({});
PickerNetwork.args = SAMPLE_PICKERNETWORK_PROPS;
