import {
  ConnectionStatus,
  ServiceStatus,
} from '@metamask/sdk-communication-layer';
import { PROVIDER_UPDATE_TYPE } from './ProviderUpdateType';

export const MetaMaskSDKEvent = {
  Initialized: 'initialized',
  DisplayURI: 'display_uri',
  ProviderUpdate: 'provider_update',
  ConnectWithResponse: 'connectWithResponse',
  ConnectionStatus: 'connection_status',
  ServiceStatus: 'service_status',
} as const;

export type MetaMaskSDKEventType =
  (typeof MetaMaskSDKEvent)[keyof typeof MetaMaskSDKEvent];

export interface MetaMaskSDKEvents {
  [MetaMaskSDKEvent.Initialized]: {
    chainId: string;
    isConnected: boolean;
    isMetaMask: boolean;
    selectedAddress: string | null | undefined;
    networkVersion: string | null | undefined;
  };
  [MetaMaskSDKEvent.DisplayURI]: string;
  [MetaMaskSDKEvent.ProviderUpdate]: PROVIDER_UPDATE_TYPE;
  [MetaMaskSDKEvent.ConnectWithResponse]: unknown;
  [MetaMaskSDKEvent.ConnectionStatus]: ConnectionStatus;
  [MetaMaskSDKEvent.ServiceStatus]: ServiceStatus;
}

export type MetaMaskSDKEventPayload<T extends MetaMaskSDKEventType> =
  T extends keyof MetaMaskSDKEvents ? MetaMaskSDKEvents[T] : unknown;
