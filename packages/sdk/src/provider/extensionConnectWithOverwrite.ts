import { rpcWithAccountParam, RPC_METHODS } from '../config';
import { MetaMaskSDK } from '../sdk';
import { logger } from '../utils/logger';

export const extensionConnectWithOverwrite = async ({
  method,
  sdk,
  params,
}: {
  method: string;
  sdk: MetaMaskSDK;
  params: any;
}) => {
  if (!sdk.isExtensionActive()) {
    throw new Error(`SDK state invalid -- extension is not active`);
  }

  logger(
    `[MetaMaskProvider: extensionConnectWithOverwrite()] Overwriting request method`,
    method,
    params,
  );

  const accounts = (await sdk.getProvider()?.request({
    method: RPC_METHODS.ETH_REQUESTACCOUNTS,
    params: [],
  })) as string[];
  if (!accounts.length) {
    throw new Error(`SDK state invalid -- undefined accounts`);
  }

  if (method?.toLowerCase() === RPC_METHODS.PERSONAL_SIGN.toLowerCase()) {
    const connectedRpc = {
      method,
      params: [params[0], accounts[0]],
    };
    return await sdk.getProvider()?.request(connectedRpc);
  } else if (
    method?.toLowerCase() === RPC_METHODS.ETH_SENDTRANSACTION.toLowerCase()
  ) {
    const connectedRpc = {
      method,
      params: [
        {
          ...params[0],
          from: accounts[0],
        },
      ],
    };
    return await sdk.getProvider()?.request(connectedRpc);
  }

  // TODO: implement overwrite for each remaining signedTyped methods
  if (rpcWithAccountParam.includes(method.toLowerCase())) {
    console.warn(
      `MetaMaskSDK connectWith method=${method} -- not handled by the extension -- call separately`,
    );
    return accounts;
  }

  // Re-create the query on the active provider
  return await sdk.getProvider()?.request({
    method,
    params,
  });
};
