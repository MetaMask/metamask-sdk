import { logger } from '../../../utils/logger';
import { cleanupListeners } from '../EventListeners/cleanupListeners';
import { RemoteConnectionState } from '../RemoteConnection';

export function cleanupConnector(state: RemoteConnectionState) {
  logger(`[RemoteConnection: cleanupConnector()] cleaning up connector`);

  if (state.connector) {
    cleanupListeners(state);
    state.connector.disconnect({ terminate: true }).catch((error) => {
      logger(
        `[RemoteConnection: cleanupConnector()] error disconnecting connector`,
        error,
      );
    });
  }
}
