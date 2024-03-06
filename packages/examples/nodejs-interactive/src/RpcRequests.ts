import { Buffer } from 'buffer';
import { RpcRequest, polygonDetails } from './Constants';

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

export const personalSignRequest = (selectedAddress: string, message: string = 'Hello World!'): RpcRequest => {
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

export const addPolygonChain = (): RpcRequest => {
  return {
    method: 'wallet_addEthereumChain',
    params: [polygonDetails],
  }
}

export const batchRequests = (requests: RpcRequest[]): RpcRequest => {
  return {
    method: 'metamask_batch',
    params: requests,
  }
}
