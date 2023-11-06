import { SendAnalytics } from './Analytics';
import { ECIES, ECIESProps } from './ECIES';
import {
  RemoteCommunication,
  RemoteCommunicationProps,
} from './RemoteCommunication';
import {
  RPCMethodCache,
  RPCMethodResult,
  SocketService,
} from './SocketService';
import { DEFAULT_SERVER_URL } from './config';
import { AutoConnectOptions } from './types/AutoConnectOptions';
import { AutoConnectType } from './types/AutoConnectType';
import { ChannelConfig } from './types/ChannelConfig';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { ConnectionStatus } from './types/ConnectionStatus';
import { DappMetadata } from './types/DappMetadata';
import { DisconnectOptions } from './types/DisconnectOptions';
import { EventType } from './types/EventType';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { MessageType } from './types/MessageType';
import { OriginatorInfo } from './types/OriginatorInfo';
import { PlatformType } from './types/PlatformType';
import { ServiceStatus } from './types/ServiceStatus';
import { WalletInfo } from './types/WalletInfo';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { StorageManager, StorageManagerProps } from './types/StorageManager';
import { TrackingEvents } from './types/TrackingEvent';

export type {
  AutoConnectOptions,
  ChannelConfig,
  CommunicationLayerLoggingOptions,
  CommunicationLayerMessage,
  DappMetadata,
  DisconnectOptions,
  ECIESProps,
  KeyInfo,
  OriginatorInfo,
  RPCMethodCache,
  RPCMethodResult,
  RemoteCommunicationProps,
  ServiceStatus,
  StorageManager,
  StorageManagerProps,
  WalletInfo,
};

export {
  AutoConnectType,
  CommunicationLayerPreference,
  ConnectionStatus,
  DEFAULT_SERVER_URL,
  ECIES,
  EventType,
  MessageType,
  PlatformType,
  RemoteCommunication,
  SendAnalytics,
  SocketService,
  TrackingEvents,
};
