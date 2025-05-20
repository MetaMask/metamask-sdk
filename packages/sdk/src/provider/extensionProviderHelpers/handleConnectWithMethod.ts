import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS, rpcWithAccountParam } from '../../config';
import { trackRpcOutcome } from './analyticsHelper';

export const handleConnectWithMethod = async ({
  target,
  params,
}: {
  target: MetaMaskInpageProvider;
  params: any[];
}) => {
  const [rpc] = params;
  const currentRpcMethod = rpc.method;
  const currentRpcParams = rpc.params;

  let resp: any;
  let caughtError: any = null;

  try {
    const accounts = (await target.request({
      method: RPC_METHODS.ETH_REQUESTACCOUNTS,
      params: [],
    })) as string[];

    if (!Array.isArray(accounts) || !accounts.length) {
      throw new Error('SDK state invalid -- undefined accounts');
    }

    if (
      currentRpcMethod?.toLowerCase() ===
      RPC_METHODS.PERSONAL_SIGN.toLowerCase()
    ) {
      resp = await target.request({
        method: currentRpcMethod,
        params: [currentRpcParams[0], accounts[0]],
      });
      return resp;
    }

    if (
      currentRpcMethod?.toLowerCase() ===
      RPC_METHODS.ETH_SENDTRANSACTION.toLowerCase()
    ) {
      resp = await target.request({
        method: currentRpcMethod,
        params: [{ ...currentRpcParams[0], from: accounts[0] }],
      });
      return resp;
    }

    if (rpcWithAccountParam.includes(currentRpcMethod.toLowerCase())) {
      console.warn(
        `MetaMaskSDK connectWith method=${currentRpcMethod} -- not handled by the extension -- call separately`,
      );
      resp = accounts;
      return resp;
    }

    resp = await target.request({
      method: currentRpcMethod,
      params: currentRpcParams,
    });
    return resp;
  } catch (error) {
    caughtError = error;
    throw error;
  } finally {
    trackRpcOutcome(currentRpcMethod, resp, caughtError);
  }
};
