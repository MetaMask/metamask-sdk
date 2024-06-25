import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS, rpcWithAccountParam } from '../../config';

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
  const accounts = (await target.request({
    method: RPC_METHODS.ETH_REQUESTACCOUNTS,
    params: [],
  })) as string[];

  if (!accounts.length) {
    throw new Error('SDK state invalid -- undefined accounts');
  }

  if (
    currentRpcMethod?.toLowerCase() === RPC_METHODS.PERSONAL_SIGN.toLowerCase()
  ) {
    return await target.request({
      method: currentRpcMethod,
      params: [currentRpcParams[0], accounts[0]],
    });
  } else if (
    currentRpcMethod?.toLowerCase() ===
    RPC_METHODS.ETH_SENDTRANSACTION.toLowerCase()
  ) {
    return await target.request({
      method: currentRpcMethod,
      params: [{ ...currentRpcParams[0], from: accounts[0] }],
    });
  }

  if (rpcWithAccountParam.includes(currentRpcMethod.toLowerCase())) {
    console.warn(
      `MetaMaskSDK connectWith method=${currentRpcMethod} -- not handled by the extension -- call separately`,
    );
    return accounts;
  }

  return await target.request({
    method: currentRpcMethod,
    params: currentRpcParams,
  });
};
