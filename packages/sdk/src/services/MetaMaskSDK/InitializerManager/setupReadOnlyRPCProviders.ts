import { MetaMaskSDK } from '../../../sdk';

export interface RPC_URLS_MAP {
  [chainId: `0x${string}`]: string;
}

export const setupReadOnlyRPCProviders = async (instance: MetaMaskSDK) => {
  const { options, debug } = instance;
  const { readonlyRPCMap } = options;

  if (!readonlyRPCMap) {
    return;
  }

  try {
    if (debug) {
      console.debug(
        `[setupReadOnlyRPCProviders] Readonly RCP Setup`,
        instance.options.readonlyRPCMap,
      );
    }

    instance.setReadOnlyRPCCalls(true);
  } catch (err) {
    throw new Error(`Invalid Infura Settings`);
  }
};
