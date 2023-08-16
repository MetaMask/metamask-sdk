import EventEmitter2 from 'eventemitter2';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';
import { ServiceStatus } from '../../types/ServiceStatus';

export function setConnectionStatus(
  connectionStatus: ConnectionStatus,
  state: RemoteCommunicationState,
  emit: EventEmitter2['emit'],
) {
  if (state._connectionStatus === connectionStatus) {
    return; // Don't re-emit current status.
  }
  state._connectionStatus = connectionStatus;
  emit(EventType.CONNECTION_STATUS, connectionStatus);

  const serviceStatus: ServiceStatus = {
    originatorInfo: state.originatorInfo,
    keyInfo: state.communicationLayer?.getKeyInfo(),
    connectionStatus: state._connectionStatus,
    channelConfig: state.channelConfig,
    channelId: state.channelId,
  };

  emit(EventType.SERVICE_STATUS, serviceStatus);
}
