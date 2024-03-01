import { logger } from '../../../utils/logger';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { handleAuthorization } from '../ConnectionManager';

/**
 * Asynchronously sends a message using the given `RemoteCommunication` instance.
 *
 * The function first checks if the system is in an appropriate state to send the message.
 * This includes ensuring that the communication isn't paused, the system is ready,
 * it's connected, and the clients are also connected.
 *
 * If the system isn't in a ready state, the function waits for the `CLIENTS_READY` event
 * to be emitted, signaling that it can proceed with sending the message. Once this event
 * is triggered, the function tries to authorize and send the message.
 *
 * If the system is already in a ready state, it proceeds directly to authorize and send
 * the message, handling any potential errors.
 *
 * If `debug` mode is enabled, the function logs crucial information, providing visibility
 * into its operations, which can be valuable for debugging.
 *
 * @param instance The `RemoteCommunication` instance used to send the message.
 * @param message The message of type `CommunicationLayerMessage` to be sent.
 * @returns A Promise that resolves once the message is sent or rejects with an error.
 */
export async function sendMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
): Promise<void> {
  const { state } = instance;

  logger.RemoteCommunication(
    `[RemoteCommunication: sendMessage()] context=${state.context} paused=${
      state.paused
    } ready=${state.ready} authorized=${
      state.authorized
    } socket=${state.communicationLayer?.isConnected()} clientsConnected=${
      state.clientsConnected
    } status=${state._connectionStatus}`,
    message,
  );

  if (
    state.paused ||
    !state.ready ||
    !state.communicationLayer?.isConnected() ||
    !state.clientsConnected
  ) {
    logger.RemoteCommunication(
      `[RemoteCommunication: sendMessage()] context=${state.context}  SKIP message waiting for MM mobile readiness.`,
    );

    await new Promise<void>((resolve) => {
      instance.once(EventType.CLIENTS_READY, resolve);
    });

    logger.RemoteCommunication(
      `[RemoteCommunication: sendMessage()] context=${state.context}  AFTER SKIP / READY -- sending pending message`,
    );
  }

  try {
    await handleAuthorization(instance, message);
  } catch (err) {
    console.error(
      `[RemoteCommunication: sendMessage()] context=${state.context}  ERROR`,
      err,
    );
    throw err;
  }
}
