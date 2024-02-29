import { logger } from '../../../utils/logger';
import { RPC_METHODS } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';

export async function connectWith({
  instance,
  rpc,
}: {
  instance: MetaMaskSDK;
  rpc: { method: string; params: any[] };
}) {
  if (!instance._initialized) {
    logger(
      `[MetaMaskSDK: connectWith()] provider not ready -- wait for init()`,
    );

    await instance.init();
  }

  logger(`[MetaMaskSDK: connectWith()] method: ${rpc.method} rpc=${rpc}`);

  if (!instance.activeProvider) {
    throw new Error(`SDK state invalid -- undefined provider`);
  }

  return instance.activeProvider.request({
    method: RPC_METHODS.METAMASK_CONNECTWITH,
    params: [rpc],
  });
}
