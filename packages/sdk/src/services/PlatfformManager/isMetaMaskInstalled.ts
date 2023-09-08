import { PlatformManager } from '../../Platform/PlatfformManager';
import { Ethereum } from '../Ethereum';

export function isMetaMaskInstalled(instance: PlatformManager) {
  const { state } = instance;

  const eth = Ethereum.getProvider() || window?.ethereum;
  if (state.debug) {
    console.debug(
      `Platform::isMetaMaskInstalled isMetaMask=${
        eth?.isMetaMask
      } isConnected=${eth?.isConnected()}`,
    );
  }
  return eth?.isMetaMask && eth?.isConnected();
}
