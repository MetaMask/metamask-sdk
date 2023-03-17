import { CommunicationLayerLoggingOptions } from '@metamask/sdk-communication-layer';

export interface SDKLoggingOptions extends CommunicationLayerLoggingOptions {
  // automatically switch all logging options on
  developerMode?: boolean;
  sdk?: boolean;
}
