export interface RpcRequest {
  method: string;
  params: any[];
}

export const polygonDetails = {
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
