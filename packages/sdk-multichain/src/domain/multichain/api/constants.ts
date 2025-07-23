/* c8 ignore start */
import type { RPC_URLS_MAP } from './types';

export const infuraRpcUrls: RPC_URLS_MAP = {
  // ###### Ethereum ######
  // Mainnet
  'eip155:1': 'https://mainnet.infura.io/v3/',
  // Goerli
  'eip155:5': 'https://goerli.infura.io/v3/',
  // Sepolia 11155111
  'eip155:11155111': 'https://sepolia.infura.io/v3/',
  // ###### Linea ######
  // Mainnet Alpha
  'eip155:59144': 'https://linea-mainnet.infura.io/v3/',
  // Testnet ( linea goerli )
  'eip155:59140': 'https://linea-goerli.infura.io/v3/',
  // ###### Polygon ######
  // Mainnet
  'eip155:137': 'https://polygon-mainnet.infura.io/v3/',
  // Mumbai
  'eip155:80001': 'https://polygon-mumbai.infura.io/v3/',
  // ###### Optimism ######
  // Mainnet
  'eip155:10': 'https://optimism-mainnet.infura.io/v3/',
  // Goerli
  'eip155:420': 'https://optimism-goerli.infura.io/v3/',
  // ###### Arbitrum ######
  // Mainnet
  'eip155:42161': 'https://arbitrum-mainnet.infura.io/v3/',
  // Goerli
  'eip155:421613': 'https://arbitrum-goerli.infura.io/v3/',
  // ###### Palm ######
  // Mainnet
  'eip155:11297108109': 'https://palm-mainnet.infura.io/v3/',
  // Testnet
  'eip155:11297108099': 'https://palm-testnet.infura.io/v3/',
  // ###### Avalanche C-Chain ######
  // Mainnet
  'eip155:43114': 'https://avalanche-mainnet.infura.io/v3/',
  // Fuji
  'eip155:43113': 'https://avalanche-fuji.infura.io/v3/',
  // // ###### NEAR ######
  // // Mainnet
  // 'near:mainnet': `https://near-mainnet.infura.io/v3/`,
  // // Testnet
  // 'near:testnet': `https://near-testnet.infura.io/v3/`,
  // ###### Aurora ######
  // Mainnet
  'eip155:1313161554': 'https://aurora-mainnet.infura.io/v3/',
  // Testnet
  'eip155:1313161555': 'https://aurora-testnet.infura.io/v3/',
  // ###### StarkNet ######
  // Mainnet
  //
  // 'starknet:SN_MAIN': `https://starknet-mainnet.infura.io/v3/`,
  // // Goerli
  // 'starknet:SN_GOERLI': `https://starknet-goerli.infura.io/v3/`,
  // // Goerli 2
  // 'starknet:SN_GOERLI2': `https://starknet-goerli2.infura.io/v3/`,
  // ###### Celo ######
  // Mainnet
  'eip155:42220': 'https://celo-mainnet.infura.io/v3/',
  // Alfajores Testnet
  'eip155:44787': 'https://celo-alfajores.infura.io/v3/',
};

/**
 * Standard RPC method names used in the MetaMask ecosystem.
 *
 * This constant provides a centralized registry of all supported
 * RPC methods, making it easier to reference them consistently
 * throughout the codebase.
 */
export const RPC_METHODS = {
  /** Get the current provider state */
  METAMASK_GETPROVIDERSTATE: 'metamask_getProviderState',
  /** Connect and sign in a single operation */
  METAMASK_CONNECTSIGN: 'metamask_connectSign',
  /** Connect with specific parameters */
  METAMASK_CONNECTWITH: 'metamask_connectWith',
  /** Open MetaMask interface */
  METAMASK_OPEN: 'metamask_open',
  /** Execute multiple operations in a batch */
  METAMASK_BATCH: 'metamask_batch',
  /** Sign a message with personal_sign */
  PERSONAL_SIGN: 'personal_sign',
  /** Request wallet permissions */
  WALLET_REQUESTPERMISSIONS: 'wallet_requestPermissions',
  /** Revoke wallet permissions */
  WALLET_REVOKEPERMISSIONS: 'wallet_revokePermissions',
  /** Get current wallet permissions */
  WALLET_GETPERMISSIONS: 'wallet_getPermissions',
  /** Watch/add a token to the wallet */
  WALLET_WATCHASSET: 'wallet_watchAsset',
  /** Add a new Ethereum chain */
  WALLET_ADDETHEREUMCHAIN: 'wallet_addEthereumChain',
  /** Switch to a different Ethereum chain */
  WALLET_SWITCHETHEREUMCHAIN: 'wallet_switchEthereumChain',
  /** Request account access */
  ETH_REQUESTACCOUNTS: 'eth_requestAccounts',
  /** Get available accounts */
  ETH_ACCOUNTS: 'eth_accounts',
  /** Get current chain ID */
  ETH_CHAINID: 'eth_chainId',
  /** Send a transaction */
  ETH_SENDTRANSACTION: 'eth_sendTransaction',
  /** Sign typed data */
  ETH_SIGNTYPEDDATA: 'eth_signTypedData',
  /** Sign typed data v3 */
  ETH_SIGNTYPEDDATA_V3: 'eth_signTypedData_v3',
  /** Sign typed data v4 */
  ETH_SIGNTYPEDDATA_V4: 'eth_signTypedData_v4',
  /** Sign a transaction */
  ETH_SIGNTRANSACTION: 'eth_signTransaction',
  /** Sign arbitrary data */
  ETH_SIGN: 'eth_sign',
  /** Recover address from signature */
  PERSONAL_EC_RECOVER: 'personal_ecRecover',
};

/**
 * Configuration mapping for RPC methods that should be redirected to the wallet.
 *
 * This constant defines which RPC methods require user interaction through
 * the wallet interface (true) versus those that can be handled locally (false).
 * Methods marked as true will redirect to the wallet for user approval.
 */
export const METHODS_TO_REDIRECT: { [method: string]: boolean } = {
  [RPC_METHODS.ETH_REQUESTACCOUNTS]: true,
  [RPC_METHODS.ETH_SENDTRANSACTION]: true,
  [RPC_METHODS.ETH_SIGNTRANSACTION]: true,
  [RPC_METHODS.ETH_SIGN]: true,
  [RPC_METHODS.PERSONAL_SIGN]: true,
  // stop redirecting these as we are caching values in the provider
  [RPC_METHODS.ETH_ACCOUNTS]: false,
  [RPC_METHODS.ETH_CHAINID]: false,
  //
  [RPC_METHODS.ETH_SIGNTYPEDDATA]: true,
  [RPC_METHODS.ETH_SIGNTYPEDDATA_V3]: true,
  [RPC_METHODS.ETH_SIGNTYPEDDATA_V4]: true,
  [RPC_METHODS.WALLET_REQUESTPERMISSIONS]: true,
  [RPC_METHODS.WALLET_GETPERMISSIONS]: true,
  [RPC_METHODS.WALLET_WATCHASSET]: true,
  [RPC_METHODS.WALLET_ADDETHEREUMCHAIN]: true,
  [RPC_METHODS.WALLET_SWITCHETHEREUMCHAIN]: true,
  [RPC_METHODS.METAMASK_CONNECTSIGN]: true,
  [RPC_METHODS.METAMASK_CONNECTWITH]: true,
  [RPC_METHODS.PERSONAL_EC_RECOVER]: true,
  [RPC_METHODS.METAMASK_BATCH]: true,
  [RPC_METHODS.METAMASK_OPEN]: true,
};
