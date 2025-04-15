import { SendAnalytics } from '@metamask/analytics-client';
import { TrackingEvents } from '@metamask/sdk-types';
import packageJson from '../../../../package.json';
import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { InternalEventType } from '../../../types/InternalEventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { lcLogguedRPCs } from '../MessageHandlers';

/**
 * Returns a handler function to handle incoming messages.
 * This handler processes the incoming message based on its type and key exchange status.
 *
 * @param instance The current instance of the SocketService.
 * @param channelId The ID of the channel the message belongs to.
 * @returns {Function} A handler function for incoming messages.
 */
export function handleMessage(instance: SocketService, channelId: string) {
  return (rawMsg: {
    ackId?: string;
    message: string | { type: string; [key: string]: any };
    error?: any;
  }) => {
    const { ackId, message, error } = rawMsg;
    const relayPersistence = instance.remote.state.relayPersistence ?? false;

    logger.SocketService(
      `[SocketService handleMessage()]  relayPersistence=${relayPersistence}  context=${
        instance.state.context
      } on 'message' ${channelId} keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      rawMsg,
    );

    if (error) {
      logger.SocketService(`
      [SocketService handleMessage()] context=${instance.state.context}::on 'message' error=${error}`);

      throw new Error(error);
    }

    const isEncryptedMessage = typeof message === 'string';

    if (
      !isEncryptedMessage &&
      message?.type === KeyExchangeMessageType.KEY_HANDSHAKE_START
    ) {
      if (relayPersistence) {
        console.warn(
          `[SocketService handleMessage()] Ignoring key exchange message because relay persistence is activated`,
          message,
        );
        return;
      }

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

    if (!isEncryptedMessage && message?.type?.startsWith('key_handshake')) {
      if (relayPersistence) {
        console.warn(
          `[SocketService handleMessage()] Ignoring key exchange message because relay persistence is activated`,
          message,
        );
        return;
      }

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

    if (isEncryptedMessage && !instance.state.keyExchange?.areKeysExchanged()) {
      // Sometime the keys exchanged status is not updated correctly
      // check if we can decrypt the message without errors and if so update the status and continue.
      let canDecrypt = false;
      try {
        logger.SocketService(
          `[SocketService handleMessage()] context=${instance.state.context}::on 'message' trying to decrypt message`,
        );
        instance.state.keyExchange?.decryptMessage(message);
        canDecrypt = true;
      } catch (err) {
        // Ignore error.
        logger.SocketService(
          `[SocketService handleMessage()] context=${instance.state.context}::on 'message' error`,
          err,
        );
      }

      if (canDecrypt) {
        logger.SocketService(
          `Invalid key exchange status detected --- updating it.`,
        );
        instance.state.keyExchange?.setKeysExchanged(true);
      } else {
        // received encrypted message before keys were exchanged.
        if (instance.state.isOriginator) {
          instance.state.keyExchange?.start({
            isOriginator: instance.state.isOriginator ?? false,
          });
        } else {
          // Request new key exchange
          instance
            .sendMessage({
              type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
            })
            .catch((err) => {
              console.error(
                `[SocketService handleMessage()] context=${instance.state.context}::on 'message' error`,
                err,
              );
            });
        }

        //  ignore message and wait for completion.
        logger.SocketService(
          `Message ignored because invalid key exchange status. step=${
            instance.state.keyExchange?.getKeyInfo().step
          }`,
          instance.state.keyExchange?.getKeyInfo(),
          message,
        );
        return;
      }
    } else if (!isEncryptedMessage && message?.type) {
      // Even if keys were exchanged, if the message is not encrypted, emit it.
      // *** instance is not supposed to happen ***
      console.warn(
        `[SocketService handleMessage() ::on 'message' received non encrypted unkwown message`,
      );
      instance.emit(EventType.MESSAGE, message);
      return;
    }

    if (!isEncryptedMessage) {
      console.warn(
        `[SocketService handleMessage() ::on 'message' received unkwown message`,
        message,
      );
      instance.emit(EventType.MESSAGE, message);
      return;
    }

    const decryptedMessage =
      instance.state.keyExchange?.decryptMessage(message);
    const messageReceived = JSON.parse(decryptedMessage ?? '{}');

    // Acknowledge that the message was received and decryoted
    if (ackId && ackId?.length > 0) {
      logger.SocketService(
        `[SocketService handleMessage()] context=${instance.state.context}::on 'message' ackid=${ackId} channelId=${channelId}`,
      );

      instance.state.socket?.emit(EventType.MESSAGE_ACK, {
        ackId,
        channelId,
        clientType: instance.state.isOriginator ? 'dapp' : 'wallet',
      });
    }

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
              event: TrackingEvents.SDK_RPC_REQUEST_DONE,
              // Do not double send originator info, it should be extracted from cache on server.
              // Keep below commented out for reference.
              sdkVersion: instance.remote.state.sdkVersion,
              commLayerVersion: packageJson.version,
              ...instance.remote.state.originatorInfo,
              walletVersion: instance.remote.state.walletInfo?.version,
              params: {
                method: initialRPCMethod.method,
                from: 'mobile',
              },
            },
            instance.remote.state.analyticsServerUrl,
          ).catch((err: unknown) => {
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
      }
    }

    instance.emit(EventType.MESSAGE, { message: messageReceived });
  };
}
