import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';

export function handleWalletInitMessage(
  instance: RemoteCommunication,
  message: CommunicationLayerMessage,
) {
  const { state } = instance;

  if (state.isOriginator) {
    // Parse account and chainId from the message
    const data = message.data || {};
    // check if data contains accounts: string[] and chainId: string
    if (
      typeof data === 'object' &&
      'accounts' in data &&
      'chainId' in data &&
      'walletKey' in data
    ) {
      // Persist channel config
      const { channelConfig } = instance.state;
      logger.RemoteCommunication(
        `WALLET_INIT: channelConfig`,
        JSON.stringify(channelConfig, null, 2),
      );

      if (channelConfig) {
        const accounts = data.accounts as string[];
        const chainId = data.chainId as string;
        const walletKey = data.walletKey as string;

        instance.state.storageManager?.persistChannelConfig({
          ...channelConfig,
          otherKey: walletKey,
          relayPersistence: true,
        });

        instance.state.storageManager?.persistAccounts(accounts);
        instance.state.storageManager?.persistChainId(chainId);
      }

      instance.emit(EventType.WALLET_INIT, {
        accounts: data.accounts,
        chainId: data.chainId,
      });
    } else {
      console.error(
        'RemoteCommunication::on "wallet_init" -- invalid data format',
        data,
      );
    }
  }
}
