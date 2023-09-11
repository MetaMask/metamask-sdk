import { Buffer } from 'buffer';
import { CommunicationLayerMessage } from '@metamask/sdk-communication-layer';
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
    if (instance.state.debug) {
      console.debug(`[RCPMS] _onMessage `, message);
    }

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
      return;
    }

    if (message?.name !== ProviderConstants.PROVIDER) {
      return;
    }

    if (Buffer.isBuffer(message)) {
      const data = Buffer.from(message);
      instance.push(data);
    } else {
      instance.push(message);
    }
  } catch (err) {
    if (instance.state.debug) {
      console.debug(`RCPMS ignore message error`, err);
    }
  }
}
