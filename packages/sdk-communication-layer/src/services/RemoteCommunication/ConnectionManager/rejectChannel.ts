// packages/sdk-communication-layer/src/services/RemoteCommunication/ConnectionManager/connectToChannel.ts
import { analytics } from '@metamask/sdk-analytics';
import { validate } from 'uuid';
import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { SendAnalytics } from '../../../Analytics';
import { TrackingEvents } from '../../../types/TrackingEvent';
import { logger } from '../../../utils/logger';

import packageJson from '../../../../package.json';

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

  // Send analytics event
  SendAnalytics(
    {
      id: channelId,
      event: TrackingEvents.REJECTED,
      ...state.originatorInfo,
      sdkVersion: state.sdkVersion,
      commLayerVersion: packageJson.version,
      walletVersion: state.walletInfo?.version,
    },
    state.communicationServerUrl,
  ).catch((error) => {
    console.error(`rejectChannel:: Error emitting analytics event`, error);
  });

  analytics.track('wallet_connection_user_rejected', {
    anon_id: state.originatorInfo?.anonId,
  });

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
