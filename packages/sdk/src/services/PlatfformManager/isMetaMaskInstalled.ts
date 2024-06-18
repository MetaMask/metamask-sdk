import { logger } from '../../utils/logger';
import { Ethereum } from '../Ethereum';

export function isMetaMaskInstalled() {
  const eth = Ethereum.getProvider() || window?.ethereum;
  logger(
    `[PlatfformManager: isMetaMaskInstalled()] isMetaMask=${
      eth?.isMetaMask
    } isConnected=${eth?.isConnected()}`,
  );

  return eth?.isMetaMask && eth?.isConnected();
}
