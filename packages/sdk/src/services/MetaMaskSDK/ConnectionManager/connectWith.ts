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
    if (instance.debug) {
      console.log(`SDK::connectWith() provider not ready -- wait for init()`);
    }
    await instance.init();
  }

  if (instance.debug) {
    console.debug(`SDK::connectWith() method: ${rpc.method}`, rpc);
  }

  if (!instance.activeProvider) {
    throw new Error(`SDK state invalid -- undefined provider`);
  }

  return instance.activeProvider.request({
    method: RPC_METHODS.METAMASK_CONNECTWITH,
    params: [rpc],
  });
}
