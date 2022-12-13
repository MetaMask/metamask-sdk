import { ECIES } from './ECIES';
import { RemoteCommunication } from './RemoteCommunication';
import { SocketService } from './SocketService';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { MessageType } from './types/MessageType';

export type { WebRTCLib } from './types/WebRTCLib';

export {
  RemoteCommunication,
  SocketService,
  ECIES,
  MessageType,
  CommunicationLayerPreference,
};

// TODO should be removed but remaining temporarily for backward compatiblity
export default RemoteCommunication;
