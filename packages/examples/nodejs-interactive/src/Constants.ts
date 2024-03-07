export interface RpcRequest {
  method: string;
  params: any[];
}

export interface Chain {
  chainId: string;
  chainName: string;
  blockExplorerUrls: string[];
  nativeCurrency: { symbol: string, decimals: number };
  rpcUrls: string[];
}

export const chains = {
  GOERLI: {
    chainId: '0x5',
    chainName: 'Goerli',
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://goerli.infura.io/v3/'],
  } as Chain,
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
  } as Chain,
  POLYGON: {
    chainId: '0x89',
    chainName: 'Polygon',
    blockExplorerUrls: ['https://polygonscan.com'],
    nativeCurrency: { symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-mainnet.infura.io/v3/'],
  } as Chain,
  MAINNET: {
    chainId: '0x1',
    chainName: 'Mainnet',
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
  } as Chain,
}
