import EventEmitter2 from 'eventemitter2';
import packageJson from '../../../package.json';
import { SendAnalytics } from '../../Analytics';
import { ECIESProps } from '../../ECIES';
import { RemoteCommunicationState } from '../../RemoteCommunication';
import { SocketService } from '../../SocketService';
import { DEFAULT_SERVER_URL } from '../../config';
import { CommunicationLayerMessage } from '../../types/CommunicationLayerMessage';
import { CommunicationLayerPreference } from '../../types/CommunicationLayerPreference';
import { ConnectionStatus } from '../../types/ConnectionStatus';
import { EventType } from '../../types/EventType';
import { MessageType } from '../../types/MessageType';
import { OriginatorInfo } from '../../types/OriginatorInfo';
import { PlatformType } from '../../types/PlatformType';
import { TrackingEvents } from '../../types/TrackingEvent';
import { wait } from '../../utils/wait';
import { clean } from '../ChannelManager';
import { onCommunicationLayerMessage } from '../MessageHandlers';
import { setLastActiveDate } from '../StateManger';
import { setConnectionStatus } from './setConnectionStatus';

export function initCommunicationLayer({
  communicationLayerPreference,
  otherPublicKey,
  reconnect,
  ecies,
  communicationServerUrl = DEFAULT_SERVER_URL,
  state,
  emit,
}: {
  communicationLayerPreference: CommunicationLayerPreference;
  otherPublicKey?: string;
  reconnect?: boolean;
  ecies?: ECIESProps;
  communicationServerUrl?: string;
  state: RemoteCommunicationState;
  emit: EventEmitter2['emit'];
}) {
  // state.communicationLayer?.removeAllListeners();

  switch (communicationLayerPreference) {
    case CommunicationLayerPreference.SOCKET:
      state.communicationLayer = new SocketService({
        communicationLayerPreference,
        otherPublicKey,
        reconnect,
        transports: state.transports,
        communicationServerUrl,
        context: state.context,
        ecies,
        logging: state.logging,
      });
      break;
    default:
      throw new Error('Invalid communication protocol');
  }

  let url = (typeof document !== 'undefined' && document.URL) || '';
  let title = (typeof document !== 'undefined' && document.title) || '';

  if (state.dappMetadata?.url) {
    url = state.dappMetadata.url;
  }

  if (state.dappMetadata?.name) {
    title = state.dappMetadata.name;
  }

  const originatorInfo: OriginatorInfo = {
    url,
    title,
    source: state.dappMetadata?.source,
    icon: state.dappMetadata?.base64Icon,
    platform: state.platformType,
    apiVersion: packageJson.version,
  };
  state.originatorInfo = originatorInfo;

  // TODO below listeners is only added for backward compatibility with wallet < 7.3
  state.communicationLayer?.on(EventType.AUTHORIZED, async () => {
    if (state.authorized) {
      // Ignore duplicate event or already authorized
      return;
    }

    // Sometime the wallet version is not yet received upon authorized message
    const waitForWalletVersion = async () => {
      while (!state.walletInfo) {
        await wait(500);
      }
    };
    await waitForWalletVersion();

    // The event might be received twice because of a backward compatibility hack in SocketService.
    // bacward compatibility for wallet <7.3
    const compareValue = '7.3'.localeCompare(state.walletInfo?.version || '');

    if (state.debug) {
      console.debug(
        `RemoteCommunication HACK 'authorized' version=${state.walletInfo?.version} compareValue=${compareValue}`,
      );
    }

    // FIXME remove this hack pending wallet release 7.3+
    if (compareValue !== 1) {
      // ignore for version 7.3+
      return;
    }

    const isSecurePlatform =
      state.platformType === PlatformType.MobileWeb ||
      state.platformType === PlatformType.ReactNative ||
      state.platformType === PlatformType.MetaMaskMobileWebview;

    if (state.debug) {
      console.debug(
        `RemoteCommunication HACK 'authorized' platform=${state.platformType} secure=${isSecurePlatform} channel=${state.channelId} walletVersion=${state.walletInfo?.version}`,
      );
    }

    if (isSecurePlatform) {
      // Propagate authorized event.
      state.authorized = true;
      emit(EventType.AUTHORIZED);
    }
  });

  state.communicationLayer?.on(
    EventType.MESSAGE,
    (_message: CommunicationLayerMessage) => {
      let message = _message;
      // check if message is encapsulated for backward compatibility
      if (_message.message) {
        message = message.message as CommunicationLayerMessage;
      }
      onCommunicationLayerMessage(message, state, emit);
    },
  );

  state.communicationLayer?.on(EventType.CLIENTS_CONNECTED, () => {
    // Propagate the event to manage different loading states on the ui.
    if (state.debug) {
      console.debug(
        `RemoteCommunication::on 'clients_connected' channel=${
          state.channelId
        } keysExchanged=${
          state.communicationLayer?.getKeyInfo()?.keysExchanged
        }`,
      );
    }

    if (state.analytics) {
      SendAnalytics(
        {
          id: state.channelId ?? '',
          event: TrackingEvents.REQUEST,
          ...originatorInfo,
          commLayer: communicationLayerPreference,
          sdkVersion: state.sdkVersion,
          walletVersion: state.walletInfo?.version,
          commLayerVersion: packageJson.version,
        },
        state.communicationServerUrl,
      ).catch((err) => {
        console.error(`Cannot send analytics`, err);
      });
    }

    state.clientsConnected = true;
    state.originatorInfoSent = false; // Always re-send originator info.
    emit(EventType.CLIENTS_CONNECTED);
  });

  state.communicationLayer?.on(EventType.KEYS_EXCHANGED, (message) => {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::${state.context}::on commLayer.'keys_exchanged' channel=${state.channelId}`,
        message,
      );
    }

    if (state.communicationLayer?.getKeyInfo()?.keysExchanged) {
      setConnectionStatus(ConnectionStatus.LINKED, state, emit);
    }

    setLastActiveDate(state, new Date());

    if (state.analytics && state.channelId) {
      SendAnalytics(
        {
          id: state.channelId,
          event: TrackingEvents.CONNECTED,
          sdkVersion: state.sdkVersion,
          commLayer: communicationLayerPreference,
          commLayerVersion: packageJson.version,
          walletVersion: state.walletInfo?.version,
        },
        state.communicationServerUrl,
      ).catch((err) => {
        console.error(`Cannot send analytics`, err);
      });
    }

    state.isOriginator = message.isOriginator;

    if (!message.isOriginator) {
      // Don't send originator message from wallet.
      // Always Tell the DAPP metamask is ready
      // the dapp will send originator message when receiving ready.
      state.communicationLayer?.sendMessage({ type: MessageType.READY });
      state.ready = true;
      state.paused = false;
    }

    // Keep sending originator info from this location for backward compatibility
    if (message.isOriginator && !state.originatorInfoSent) {
      // Always re-send originator info in case the session was deleted on the wallet
      state.communicationLayer?.sendMessage({
        type: MessageType.ORIGINATOR_INFO,
        originatorInfo: state.originatorInfo,
        originator: state.originatorInfo,
      });
      state.originatorInfoSent = true;
    }
  });

  state.communicationLayer?.on(EventType.SOCKET_DISCONNECTED, () => {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_Disconnected' set ready to false`,
      );
    }
    state.ready = false;
  });

  state.communicationLayer?.on(EventType.SOCKET_RECONNECT, () => {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::on 'socket_reconnect' -- reset key exchange status / set ready to false`,
      );
    }
    state.ready = false;
    clean(state);
  });

  state.communicationLayer?.on(
    EventType.CLIENTS_DISCONNECTED,
    (channelId: string) => {
      if (state.debug) {
        console.debug(
          `RemoteCommunication::${state.context}]::on 'clients_disconnected' channelId=${channelId}`,
        );
      }

      state.clientsConnected = false;

      // Propagate the disconnect event to clients.
      emit(EventType.CLIENTS_DISCONNECTED, state.channelId);
      setConnectionStatus(ConnectionStatus.DISCONNECTED, state, emit);

      state.ready = false;
      state.authorized = false;

      if (state.analytics && state.channelId) {
        SendAnalytics(
          {
            id: state.channelId,
            event: TrackingEvents.DISCONNECTED,
            sdkVersion: state.sdkVersion,
            commLayer: communicationLayerPreference,
            commLayerVersion: packageJson.version,
            walletVersion: state.walletInfo?.version,
          },
          state.communicationServerUrl,
        ).catch((err) => {
          console.error(`Cannot send analytics`, err);
        });
      }
    },
  );

  state.communicationLayer?.on(EventType.CHANNEL_CREATED, (id) => {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::${state.context}::on 'channel_created' channelId=${id}`,
      );
    }
    emit(EventType.CHANNEL_CREATED, id);
  });

  state.communicationLayer?.on(EventType.CLIENTS_WAITING, (numberUsers) => {
    if (state.debug) {
      console.debug(
        `RemoteCommunication::${state.context}::on 'clients_waiting' numberUsers=${numberUsers} ready=${state.ready} autoStarted=${state.originatorConnectStarted}`,
      );
    }

    setConnectionStatus(ConnectionStatus.WAITING, state, emit);

    emit(EventType.CLIENTS_WAITING, numberUsers);
    if (state.originatorConnectStarted) {
      if (state.debug) {
        console.debug(
          `RemoteCommunication::on 'clients_waiting' watch autoStarted=${state.originatorConnectStarted} timeout`,
          state.autoConnectOptions,
        );
      }

      const timeout = state.autoConnectOptions?.timeout || 3000;
      const timeoutId = setTimeout(() => {
        if (state.debug) {
          console.debug(
            `RemoteCommunication::on setTimeout(${timeout}) terminate channelConfig`,
            state.autoConnectOptions,
          );
        }
        // Cleanup previous channelId
        // state.storageManager?.terminate();
        state.originatorConnectStarted = false;
        if (!state.ready) {
          setConnectionStatus(ConnectionStatus.TIMEOUT, state, emit);
        }
        clearTimeout(timeoutId);
      }, timeout);
    }
  });
}
