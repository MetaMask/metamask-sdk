// packages/sdk-communication-layer/src/services/RemoteCommunication/ConnectionManager/connectToChannel.ts
import { validate } from 'uuid';
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
// import { logger } from '../../../utils/logger';

const logger = {
  RemoteCommunication: (message: string, ...args: unknown[]) => {
    console.log(message, ...args);
  },
};

/**
 * Rejects a channel connection from the wallet.
 *
 * @param channelId Unique identifier for the channel.
 * @param state Current state of the RemoteCommunication class instance.
 * @returns void
 */
export async function rejectChannel({
  channelId,
  state,
}: {
  channelId: string;
  state: RemoteCommunicationState;
}): Promise<unknown> {
  if (!validate(channelId)) {
    logger.RemoteCommunication(
      `[RemoteCommunication: connectToChannel()] context=${state.context} invalid channel channelId=${channelId}`,
    );
    throw new Error(`Invalid channel ${channelId}`);
  }

  if (state.isOriginator) {
    // only wallet can reject
    logger.RemoteCommunication(
      `[RemoteCommunication: reject()] context=${state.context} isOriginator=${state.isOriginator} channelId=${channelId}`,
    );
    return;
  }

  const { socket } = state.communicationLayer?.state ?? {};

  if (!socket?.connected) {
    logger.RemoteCommunication(
      `[RemoteCommunication: reject()] context=${state.context} socket already connected`,
    );
    socket?.connect();
  }

  logger.RemoteCommunication(
    `[RemoteCommunication: reject()] context=${state.context} channelId=${channelId} socket=${socket} emitting ${EventType.REJECTED}`,
  );

  // emit reject event
  await new Promise<unknown>((resolve, reject) => {
    socket?.emit(
      EventType.REJECTED,
      {
        channelId,
      },
      (error: unknown, response: unknown) => {
        logger.RemoteCommunication(
          `[RemoteCommunication: reject()] context=${state.context} socket=${socket?.id}`,
          { error, response },
        );

        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      },
    );
  });
}
