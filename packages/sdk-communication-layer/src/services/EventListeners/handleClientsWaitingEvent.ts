import { RemoteCommunication } from '../../RemoteCommunication';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';

export function handleClientsWaitingEvent(instance: RemoteCommunication) {
  return (numberUsers: number) => {
    if (instance.state.debug) {
      console.debug(
        `RemoteCommunication::${instance.state.context}::on 'clients_waiting' numberUsers=${numberUsers} ready=${instance.state.ready} autoStarted=${instance.state.originatorConnectStarted}`,
      );
    }

    instance.setConnectionStatus(ConnectionStatus.WAITING);

    instance.emit(EventType.CLIENTS_WAITING, numberUsers);
    if (instance.state.originatorConnectStarted) {
      if (instance.state.debug) {
        console.debug(
          `RemoteCommunication::on 'clients_waiting' watch autoStarted=${instance.state.originatorConnectStarted} timeout`,
          instance.state.autoConnectOptions,
        );
      }

      const timeout = instance.state.autoConnectOptions?.timeout || 3000;
      const timeoutId = setTimeout(() => {
        if (instance.state.debug) {
          console.debug(
            `RemoteCommunication::on setTimeout(${timeout}) terminate channelConfig`,
            instance.state.autoConnectOptions,
          );
        }
        // Cleanup previous channelId
        // instance.state.storageManager?.terminate();
        instance.state.originatorConnectStarted = false;
        if (!instance.state.ready) {
          instance.setConnectionStatus(ConnectionStatus.TIMEOUT);
        }
        clearTimeout(timeoutId);
      }, timeout);
    }
  };
}
