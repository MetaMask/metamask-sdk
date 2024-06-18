import { logger } from '../../../utils/logger';
import { MetaMaskSDK } from '../../../sdk';

export interface RPC_URLS_MAP {
  [chainId: `0x${string}`]: string;
}

export const setupReadOnlyRPCProviders = async (instance: MetaMaskSDK) => {
  const { options } = instance;
  const { readonlyRPCMap } = options;

  if (!readonlyRPCMap) {
    return;
  }

  try {
    logger(
      `[MetaMaskSDK: setupReadOnlyRPCProviders()] Setting up Readonly RPC Providers`,
      readonlyRPCMap,
    );

    instance.setReadOnlyRPCCalls(true);
  } catch (err) {
    throw new Error(`Invalid Infura Settings`);
  }
};
