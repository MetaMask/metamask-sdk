export const foxLogo = '                                   \n' +
  ' **==                         =+** \n' +
  ' ****+===                 ===+**** \n' +
  '********=====---------=====********\n' +
  '**********+===-------===+**********\n' +
  '*************=-------=*************\n' +
  ' *************+-----+************* \n' +
  ' ***********+==-----==+*********** \n' +
  ' ********+======----=====+******** \n' +
  '  *+==--========---========--==+*  \n' +
  '  ------========---========------  \n' +
  ' --------==+#*==---==##+==-------- \n' +
  '----------=---==---==---=----------\n' +
  '---========----=---=----========---\n' +
  '===============+++++===============\n' +
  '============-::#####-:-=========== \n' +
  ' =========-::::-----::::-========= \n' +
  ' =====      -----------      ===== \n' +
  '                                   '

export const connectType = {
  CONNECT_AND_SIGN: 'CONNECT_AND_SIGN',
  CONNECT_WITH_CHAIN_SWITCH: 'CONNECT_WITH_CHAIN_SWITCH',
  CONNECT_WITH_ADD_CHAIN: 'CONNECT_WITH_ADD_CHAIN',
  CONNECT: 'CONNECT'
} as const;

export type ConnectType = (typeof connectType)[keyof typeof connectType];

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
  LINEA: {
    chainId: '0xe708',
    chainName: 'Linea',
    blockExplorerUrls: ['https://lineascan.build/'],
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://linea.infura.io/v3/'],
  },
}
