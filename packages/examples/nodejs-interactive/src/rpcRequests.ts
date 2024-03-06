import { Buffer } from 'buffer';

interface RpcRequest {
  method: string;
  params: any[];
}

const polygonDetails = {
  chainId: '0x89',
  chainName: 'Polygon',
  blockExplorerUrls: ['https://polygonscan.com'],
  nativeCurrency: { symbol: 'MATIC', decimals: 18 },
  rpcUrls: ['https://polygon-rpc.com/'],
}

export const chains = {
  GOERLI: '0x5',
  SEPOLIA: '0xaa36a7',
  MAINNET: '0x1',
  POLYGON: '0x89',
}

export const sendTransactionRequest = (selectedAddress: string, amount: string = '0x5AF3107A4000'): RpcRequest => {
  const to = '0x0000000000000000000000000000000000000000';
  const transactionParameters = {
    to, // Required except during contract publications.
    from: selectedAddress, // must match user's active address.
    value: amount,
  };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
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
