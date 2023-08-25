import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { handleKeyHandshake, validateKeyExchange } from '../KeysManager';
import { encryptAndSendMessage } from './encryptAndSendMessage';
import { handleRpcReplies } from './handleRpcReplies';
import { trackRpcMethod } from './trackRpcMethod';

/**
 * Handles sending a message using the SocketService instance.
 * It first checks if a channel has been created and throws an error if not.
 * Then, it logs debug information about the message and its encryption status.
 * It checks if the message is a key handshake message and handles it if it is.
 * If the message is not a key handshake message, it validates the key exchange status.
 * It tracks the RPC method if applicable.
 * It encrypts and sends the message.
 * Finally, if the user is the originator, it waits for a reply in case of certain messages.
 *
 * @param instance The current instance of the SocketService.
 * @param message The message to be sent.
 */
export function handleSendMessage(
  instance: SocketService,
  message: CommunicationLayerMessage,
) {
  if (!instance.state.channelId) {
    throw new Error('Create a channel first');
  }

  if (instance.state.debug) {
    console.debug(
      `SocketService::${
        instance.state.context
      }::sendMessage() areKeysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
      message,
    );
  }

  const isKeyHandshakeMessage = message?.type?.startsWith('key_handshake');

  if (isKeyHandshakeMessage) {
    handleKeyHandshake(instance, message);
    return;
  }

  validateKeyExchange(instance, message);

  // TODO Prevent sending same method multiple time which can sometime happen during initialization
  trackRpcMethod(instance, message);

  encryptAndSendMessage(instance, message);

  // Only makes sense on originator side.
  // wait for reply when eth_requestAccounts is sent.
  handleRpcReplies(instance, message).catch((err) => {
    console.warn('Error handleRpcReplies', err);
  });
}
