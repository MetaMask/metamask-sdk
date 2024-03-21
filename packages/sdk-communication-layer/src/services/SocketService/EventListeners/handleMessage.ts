import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { InternalEventType } from '../../../types/InternalEventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { checkSameId } from '../ChannelManager';
import { lcLogguedRPCs } from '../MessageHandlers';
import { SendAnalytics } from '../../../Analytics';
import { TrackingEvents } from '../../../types/TrackingEvent';
import packageJson from '../../../../package.json';

/**
 * Returns a handler function to handle incoming messages.
 * This handler processes the incoming message based on its type and key exchange status.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel the message belongs to.
 * @returns {Function} A handler function for incoming messages.
 */
export function handleMessage(instance: SocketService, channelId: string) {
  return ({
    id,
    message,
    error,
  }: {
    id: string;
    message: any;
    error?: any;
  }) => {
    logger.SocketService(
      `[SocketService handleMessage()] context=${
        instance.state.context
      } on 'message' ${channelId} keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      message,
    );

    if (error) {
      logger.SocketService(`
      [SocketService handleMessage()] context=${instance.state.context}::on 'message' error=${error}`);

      throw new Error(error);
    }

    try {
      checkSameId(instance.state, id);
    } catch (err) {
      console.error(`ignore message --- wrong id `, message);
      return;
    }

    if (
      instance.state.isOriginator &&
      message?.type === KeyExchangeMessageType.KEY_HANDSHAKE_START
    ) {
      logger.SocketService(
        `[SocketService handleMessage()] context=${instance.state.context}::on 'message' received HANDSHAKE_START isOriginator=${instance.state.isOriginator}`,
        message,
      );

      instance.state.keyExchange?.start({
        isOriginator: instance.state.isOriginator ?? false,
        force: true,
      });
      return;
    }

    // TODO can be removed once session persistence fully vetted.
    if (message?.type === MessageType.PING) {
      logger.SocketService(
        `[SocketService handleMessage()] context=${instance.state.context}::on 'message' ping `,
      );

      instance.emit(EventType.MESSAGE, { message: { type: 'ping' } });
      return;
    }

    // Special case to manage resetting key exchange when keys are already exchanged
    logger.SocketService(
      `[SocketService handleMessage()] context=${
        instance.state.context
      }::on 'message' originator=${instance.state.isOriginator}, type=${
        message?.type
      }, keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
    );

    if (message?.type?.startsWith('key_handshake')) {
      logger.SocketService(
        `[SocketService handleMessage()] context=${instance.state.context}::on 'message' emit KEY_EXCHANGE`,
        message,
      );

      instance.emit(InternalEventType.KEY_EXCHANGE, {
        message,
        context: instance.state.context,
      });
      return;
    }

    if (!instance.state.keyExchange?.areKeysExchanged()) {
      // Sometime the keys exchanged status is not updated correctly
      // check if we can decrypt the message without errors and if so update the status and continue.
      let canDecrypt = false;
      try {
        instance.state.keyExchange?.decryptMessage(message);
        canDecrypt = true;
      } catch (err) {
        // Ignore error.
      }

      if (canDecrypt) {
        console.warn(`Invalid key exchange status detected --- updating it.`);
        instance.state.keyExchange?.setKeysExchanged(true);
      } else {
        // received encrypted message before keys were exchanged.
        if (instance.state.isOriginator) {
          instance.state.keyExchange?.start({
            isOriginator: instance.state.isOriginator ?? false,
          });
        } else {
          // Request new key exchange
          instance.sendMessage({
            type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
          });
        }

        //  ignore message and wait for completion.
        console.warn(
          `Message ignored because invalid key exchange status. step=${
            instance.state.keyExchange?.getKeyInfo().step
          }`,
          instance.state.keyExchange?.getKeyInfo(),
          message,
        );
        return;
      }
    } else if (message.toString().indexOf('type') !== -1) {
      // Even if keys were exchanged, if the message is not encrypted, emit it.
      // *** instance is not supposed to happen ***
      console.warn(
        `[SocketService handleMessage() ::on 'message' received non encrypted unkwown message`,
      );
      instance.emit(EventType.MESSAGE, message);
      return;
    }

    const decryptedMessage =
      instance.state.keyExchange?.decryptMessage(message);
    const messageReceived = JSON.parse(decryptedMessage ?? '{}');

    if (messageReceived?.type === MessageType.PAUSE) {
      /**
       * CommunicationLayer shouldn't be aware of the protocol details but we make an exception to manager session persistence.
       * Receiving pause is the correct way to quit MetaMask app,
       * but in case it is killed we won't receive a PAUSE signal and thus need to re-create the handshake.
       */
      instance.state.clientsPaused = true;
    } else {
      instance.state.clientsPaused = false;
    }

    if (instance.state.isOriginator && messageReceived.data) {
      // inform cache from result
      const rpcMessage = messageReceived.data as {
        id: string;
        result: unknown;
        error: {
          code: number;
          message: string;
          stack: string;
        };
      };
      const initialRPCMethod = instance.state.rpcMethodTracker[rpcMessage.id];

      if (initialRPCMethod) {
        const elapsedTime = Date.now() - initialRPCMethod.timestamp;
        logger.SocketService(
          `[SocketService handleMessage()] context=${instance.state.context}::on 'message' received answer for id=${rpcMessage.id} method=${initialRPCMethod.method} responseTime=${elapsedTime}`,
          messageReceived,
        );

        // send ack_received tracking message
        if (
          instance.remote.state.analytics &&
          lcLogguedRPCs.includes(initialRPCMethod.method.toLowerCase())
        ) {
          SendAnalytics(
            {
              id: instance.remote.state.channelId ?? '',
              event: TrackingEvents.SDK_RPC_REQUEST_RECEIVED,
              sdkVersion: instance.remote.state.sdkVersion,
              commLayerVersion: packageJson.version,
              walletVersion: instance.remote.state.walletInfo?.version,
              params: {
                method: message.method,
                from: 'mobile',
              },
            },
            instance.remote.state.communicationServerUrl,
          ).catch((err) => {
            console.error(`Cannot send analytics`, err);
          });
        }
        const rpcResult = {
          ...initialRPCMethod,
          result: rpcMessage.result,
          error: rpcMessage.error
            ? {
                code: rpcMessage.error?.code,
                message: rpcMessage.error?.message,
              }
            : undefined,
          elapsedTime,
        };
        instance.state.rpcMethodTracker[rpcMessage.id] = rpcResult;
        instance.emit(EventType.RPC_UPDATE, rpcResult);

        logger.SocketService(
          `[SocketService handleMessage()] HACK (wallet <7.3) update rpcMethodTracker`,
          rpcResult,
        );

        // FIXME hack while waiting for mobile release 7.3
        instance.emit(EventType.AUTHORIZED);
      }
    }

    instance.emit(EventType.MESSAGE, { message: messageReceived });
  };
}
