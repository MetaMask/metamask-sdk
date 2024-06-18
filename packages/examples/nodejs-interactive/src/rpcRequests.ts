import { Chain, RpcRequest } from './constants';
import { Buffer } from 'buffer';

export const sendTransactionRequest = (selectedAddress: string, amount: string = '0x5AF3107A4000'): RpcRequest => {
  const to = '0x0000000000000000000000000000000000000000';
  const transactionParameters = {
    to,
    from: selectedAddress,
    value: amount,
  };

  return {
    method: 'eth_sendTransaction',
    params: [transactionParameters],
  }
}

export const personalSignRequest = (selectedAddress: string, message: string = 'Hello form the NodeJS Interactive Example Dapp'): RpcRequest => {
  const from = selectedAddress;
  const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

  return {
    method: 'personal_sign',
    params: [hexMessage, from, 'Example password'],
  };
}

export const switchEthereumChain = (hexChainId: string): RpcRequest => {
  return {
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: hexChainId }],
  };
}

export const addEthereumChain = (chain: Chain): RpcRequest => {
  return {
    method: 'wallet_addEthereumChain',
    params: [chain],
  }
}

export const batchRequests = (requests: RpcRequest[]): RpcRequest => {
  return {
    method: 'metamask_batch',
    params: requests,
  }
}

export const getBlockNumber = (): RpcRequest => {
  return {
    method: 'eth_blockNumber',
    params: [],
  }
}

export const walletRequestPermissions = (): RpcRequest => {
  return {
    method: 'wallet_requestPermissions',
    params: [
      {
        eth_accounts: {},
      },
    ],
  }
}

export const balanceOf = (selectedAddress: string): RpcRequest => {
  return {
    method: 'eth_getBalance',
    params: [selectedAddress, 'latest'],
  }
}
