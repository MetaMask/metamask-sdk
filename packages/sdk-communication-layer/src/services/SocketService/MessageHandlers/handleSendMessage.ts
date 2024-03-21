import { SendAnalytics } from '../../../Analytics';
import { TrackingEvents } from '../../../types/TrackingEvent';
import { logger } from '../../../utils/logger';
import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { handleKeyHandshake, validateKeyExchange } from '../KeysManager';
import packageJson from '../../../../package.json';
import { encryptAndSendMessage } from './encryptAndSendMessage';
import { handleRpcReplies } from './handleRpcReplies';
import { trackRpcMethod } from './trackRpcMethod';

export const lcLogguedRPCs = [
  'eth_sendTransaction',
  'eth_signTypedData',
  'eth_signTransaction',
  'wallet_requestPermissions',
  'wallet_switchEthereumChain',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'metamask_connectSign',
  'metamask_connectWith',
  'metamask_batch',
].map((method) => method.toLowerCase());

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

  logger.SocketService(
    `[SocketService: handleSendMessage()] context=${
      instance.state.context
    } areKeysExchanged=${instance.state.keyExchange?.areKeysExchanged()}`,
    message,
  );

  const isKeyHandshakeMessage = message?.type?.startsWith('key_handshake');

  if (isKeyHandshakeMessage) {
    handleKeyHandshake(instance, message);
    return;
  }

  validateKeyExchange(instance, message);

  trackRpcMethod(instance, message);

  encryptAndSendMessage(instance, message);

  if (instance.remote.state.analytics) {
    // Only logs specific RPCs
    if (
      instance.remote.state.isOriginator &&
      message.method &&
      lcLogguedRPCs.includes(message.method.toLowerCase())
    ) {
      SendAnalytics(
        {
          id: instance.remote.state.channelId ?? '',
          event: TrackingEvents.SDK_RPC_REQUEST,
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
  }

  // Only makes sense on originator side.
  // wait for reply when eth_requestAccounts is sent.
  handleRpcReplies(instance, message).catch((err) => {
    console.warn('Error handleRpcReplies', err);
  });
}
