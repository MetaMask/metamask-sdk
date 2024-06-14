import React from 'react';
import type {ServiceStatus} from '@metamask/sdk';
import {View, Text} from 'react-native';

export interface ServiceStatusViewProps {
  serviceStatus?: ServiceStatus;
}

export const ServiceStatusView = ({serviceStatus}: ServiceStatusViewProps) => {
  return (
    <View>
      <Text style={{color: 'black'}}>
        status: {serviceStatus?.connectionStatus}
      </Text>
      <Text style={{color: 'black'}}>
        key_exchange_step: {serviceStatus?.keyInfo?.step}
      </Text>
      <Text style={{color: 'black'}}>
        key_exchanged: {`${serviceStatus?.keyInfo?.keysExchanged}`}
      </Text>
      <Text style={{color: 'black'}}>Channel: {serviceStatus?.channelId}</Text>
      <Text style={{color: 'black'}}>{`Expiration: ${
        serviceStatus?.channelConfig?.validUntil ?? ''
      }`}</Text>
    </View>
  );
};
