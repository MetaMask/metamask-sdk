import { Buffer } from 'buffer';
import { CommunicationLayerMessage } from '@metamask/sdk-communication-layer';
import { logger } from '../../utils/logger';
import { RemoteCommunicationPostMessageStream } from '../../PostMessageStream/RemoteCommunicationPostMessageStream';
import { ProviderConstants } from '../../constants';

export function onMessage(
  instance: RemoteCommunicationPostMessageStream,
  message: CommunicationLayerMessage,
) {
  try {
    // validate message
    /* if (instance.state._origin !== '*' && event.origin !== instance.state._origin) {
    return;
  }*/

    logger(`[RCPMS: onMessage()] message`, message);

    const typeOfMsg = typeof message;

    if (!message || typeOfMsg !== 'object') {
      return;
    }

    // We only want reply from MetaMask.
    const typeOfData = typeof message?.data;
    if (typeOfData !== 'object') {
      return;
    }

    if (!message?.name) {
      logger(
        `[RCPMS: onMessage()] ignore message without name message=${message}`,
      );
      return;
    }

    if (message?.name !== ProviderConstants.PROVIDER) {
      logger(
        `[RCPMS: onMessage()] ignore message with wrong name message=${message}`,
      );
      return;
    }

    if (Buffer.isBuffer(message)) {
      const data = Buffer.from(message);
      instance.push(data);
    } else {
      instance.push(message);
    }
  } catch (err) {
    logger(`[RCPMS: onMessage()] ignore message error err=${err}`);
  }
}
