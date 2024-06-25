import { MetaMaskInpageProvider } from '@metamask/providers';
import { RPC_METHODS } from '../../config';

export const handleConnectSignMethod = async ({
  target,
  params,
}: {
  target: MetaMaskInpageProvider;
  params: any[];
}) => {
  const accounts = (await target.request({
    method: RPC_METHODS.ETH_REQUESTACCOUNTS,
    params: [],
  })) as string[];

  if (!accounts.length) {
    throw new Error('SDK state invalid -- undefined accounts');
  }

  return await target.request({
    method: RPC_METHODS.PERSONAL_SIGN,
    params: [params[0], accounts[0]],
  });
};
