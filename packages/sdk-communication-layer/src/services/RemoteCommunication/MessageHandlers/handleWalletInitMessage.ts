import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';

export function handleWalletInitMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  const { state } = instance;

  if (state.isOriginator) {
    // Parse account and chainId from the message
    const data = message.data || {};
    // check if data contains accounts: string[] and chainId: string
    if (typeof data === 'object' && 'accounts' in data && 'chainId' in data) {
      // propagate the information
      console.debug(
        `RemoteCommunication::on "wallet_init" -- received data`,
        data,
      );
    } else {
      console.error(
        'RemoteCommunication::on "wallet_init" -- invalid data format',
        data,
      );
    }
  }
}
