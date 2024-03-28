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

export const chains: {[name: string]: Chain} = {
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
  },
  POLYGON: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com'],
    nativeCurrency: { symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
  },
  MAINNET: {
    chainId: '0x1',
    chainName: 'Mainnet',
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
  },
}

