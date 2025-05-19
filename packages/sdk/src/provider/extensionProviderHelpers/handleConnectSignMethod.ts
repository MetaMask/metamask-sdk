import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../../config';
import { trackRpcOutcome } from './analyticsHelper';

export const handleConnectSignMethod = async ({
  target,
  params,
}: {
  target: MetaMaskInpageProvider;
  params: any[];
}) => {
  let resp: any;
  let caughtError: any = null;

  try {
    const accounts = (await target.request({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    })) as string[];

    if (!accounts.length) {
      throw new Error('SDK state invalid -- undefined accounts');
    }

    resp = await target.request({
      method: RPC_METHODS.PERSONAL_SIGN,
      params: [params[0], accounts[0]],
    });
    return resp;
  } catch (error) {
    caughtError = error;
    throw error;
  } finally {
    trackRpcOutcome(RPC_METHODS.PERSONAL_SIGN, resp, caughtError);
  }
};
