import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { InternalEventType } from '../../../types/InternalEventType';
import { KeyExchangeMessageType } from '../../../types/KeyExchangeMessageType';
import { MessageType } from '../../../types/MessageType';
import { checkSameId } from '../ChannelManager';

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
    if (instance.state.debug) {
      console.debug(
        `SocketService::${
          instance.state.context
        }::on 'message' ${channelId} keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
        message,
      );
    }

    if (error) {
      if (instance.state.debug) {
        console.debug(`
      SocketService::${instance.state.context}::on 'message' error=${error}`);
      }

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
      if (instance.state.debug) {
        console.debug(
          `SocketService::${instance.state.context}::on 'message' received HANDSHAKE_START isOriginator=${instance.state.isOriginator}`,
          message,
        );
      }

      instance.state.keyExchange?.start({
        isOriginator: instance.state.isOriginator ?? false,
        force: true,
      });
      return;
    }

    // TODO can be removed once session persistence fully vetted.
    if (message?.type === MessageType.PING) {
      if (instance.state.debug) {
        console.debug(
          `SocketService::${instance.state.context}::on 'message' ping `,
        );
      }

      instance.emit(EventType.MESSAGE, { message: { type: 'ping' } });
      return;
    }

    if (instance.state.debug) {
      // Special case to manage resetting key exchange when keys are already exchanged
      console.debug(
        `SocketService::${instance.state.context}::on 'message' originator=${
          instance.state.isOriginator
        }, type=${
          message?.type
        }, keysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      );
    }

    if (message?.type?.startsWith('key_handshake')) {
      if (instance.state.debug) {
        console.debug(
          `SocketService::${instance.state.context}::on 'message' emit KEY_EXCHANGE`,
          message,
        );
      }

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
        return;
      }

      if (canDecrypt) {
        console.warn(`Invalid key exchange status detected --- updating it.`);
        instance.state.keyExchange?.setKeysExchanged?.(true);
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
          `Message ignored because invalid key exchange status`,
          message,
        );
        return;
      }
    } else if (message.toString().indexOf('type') !== -1) {
      // Even if keys were exchanged, if the message is not encrypted, emit it.
      // *** instance is not supposed to happen ***
      console.warn(
        `SocketService::on 'message' received non encrypted unkwown message`,
      );
      instance.emit(EventType.MESSAGE, message);
      return;
    }

    const decryptedMessage =
      instance.state.keyExchange?.decryptMessage(message);
    const messageReceived = JSON.parse(decryptedMessage ?? '');

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
      };
      const initialRPCMethod = instance.state.rpcMethodTracker[rpcMessage.id];
      if (initialRPCMethod) {
        const elapsedTime = Date.now() - initialRPCMethod.timestamp;
        if (instance.state.debug) {
          console.debug(
            `SocketService::${instance.state.context}::on 'message' received answer for id=${rpcMessage.id} method=${initialRPCMethod.method} responseTime=${elapsedTime}`,
            messageReceived,
          );
        }
        const rpcResult = {
          ...initialRPCMethod,
          result: rpcMessage.result,
          elapsedTime,
        };
        instance.state.rpcMethodTracker[rpcMessage.id] = rpcResult;

        if (instance.state.debug) {
          console.debug(
            `HACK (wallet <7.3) update rpcMethodTracker`,
            rpcResult,
          );
        }
        // FIXME hack while waiting for mobile release 7.3
        instance.emit(EventType.AUTHORIZED);
      }
    }

    instance.emit(EventType.MESSAGE, { message: messageReceived });
  };
}
