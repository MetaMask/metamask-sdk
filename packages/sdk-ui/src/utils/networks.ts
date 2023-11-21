import { ImageSourcePropType } from 'react-native';
import images from '../../assets/images/image-icons';
import {
  GOERLI,
  LINEA_GOERLI,
  LINEA_MAINNET,
  MAINNET,
  NETWORKS_CHAIN_ID,
  RPC,
  SEPOLIA,
} from '../constants/networks.constants';

export interface NetworkType {
  name: string;
  shortName: string;
  networkId: number;
  chainId: number;
  hexChainId: string;
  color: string;
  networkType: string;
  imageSource: ImageSourcePropType;
}
/**
 * List of the supported networks
 * including name, id, and color
 *
 * This values are used in certain places like
 * navbar and the network switcher.
 */
export const NetworkList: { [key: string]: Partial<NetworkType> } = {
  [MAINNET]: {
    name: 'Ethereum Main Network',
    shortName: 'Ethereum',
    networkId: 1,
    chainId: 1,
    hexChainId: '0x1',
    color: '#3cc29e',
    networkType: 'mainnet',
    imageSource: images.ETHEREUM,
  },
  [LINEA_MAINNET]: {
    name: 'Linea Main Network',
    shortName: 'Linea',
    networkId: 59144,
    chainId: 59144,
    hexChainId: '0xe708',
    color: '#121212',
    networkType: 'linea-mainnet',
    imageSource: images['LINEA-MAINNET'],
  },
  [GOERLI]: {
    name: 'Goerli Test Network',
    shortName: 'Goerli',
    networkId: 5,
    chainId: 5,
    hexChainId: '0x5',
    color: '#3099f2',
    networkType: 'goerli',
    imageSource: images.GOERLI,
  },
  [SEPOLIA]: {
    name: 'Sepolia Test Network',
    shortName: 'Sepolia',
    networkId: 11155111,
    chainId: 11155111,
    hexChainId: '0xaa36a7',
    color: '#cfb5f0',
    networkType: 'sepolia',
    imageSource: images.SEPOLIA,
  },
  [LINEA_GOERLI]: {
    name: 'Linea Goerli Test Network',
    shortName: 'Linea Goerli',
    networkId: 59140,
    chainId: 59140,
    hexChainId: '0xe704',
    color: '#61dfff',
    networkType: 'linea-goerli',
    imageSource: images['LINEA-GOERLI'],
  },
  [RPC]: {
    name: 'Private Network',
    shortName: 'Private',
    color: '#f2f3f4',
    networkType: 'rpc',
  },
};

const NetworkListKeys = Object.keys(NetworkList);

export default NetworkList;

export const getAllNetworks = () =>
  NetworkListKeys.filter((name) => name !== RPC);

export const getNetworkByHexChainId = (hexChainId: string) => {
  const network = NetworkListKeys.find(
    (name) => NetworkList[name].hexChainId === hexChainId,
  );
  return network ? NetworkList[network] : undefined;
};

/**
 * Checks if network is default mainnet.
 *
 * @param {string} networkType - Type of network.
 * @returns If the network is default mainnet.
 */
export const isDefaultMainnet = (networkType: string) =>
  networkType === MAINNET;

/**
 * Check whether the given chain ID is Ethereum Mainnet.
 *
 * @param {string} chainId - The chain ID to check.
 * @returns True if the chain ID is Ethereum Mainnet, false otherwise.
 */
export const isMainNet = (chainId: string) => chainId === String(1);

export const isLineaMainnet = (networkType: string) =>
  networkType === LINEA_MAINNET;

export const getDecimalChainId = (chainId: string) => {
  if (!chainId || typeof chainId !== 'string' || !chainId.startsWith('0x')) {
    return chainId;
  }
  return parseInt(chainId, 16).toString(10);
};

export const isMainnetByChainId = (chainId: string) =>
  getDecimalChainId(String(chainId)) === String(1);

export const isLineaMainnetByChainId = (chainId: string) =>
  getDecimalChainId(String(chainId)) === String(59144);

export const isMultiLayerFeeNetwork = (chainId: string) =>
  chainId === NETWORKS_CHAIN_ID.OPTIMISM;

/**
 * Gets the test network image icon.
 *
 * @param {string} networkType - Type of network.
 * @returns - Image of test network or undefined.
 */
export const getTestNetImage = (networkType: string) => {
  if (
    networkType === GOERLI ||
    networkType === SEPOLIA ||
    networkType === LINEA_GOERLI
  ) {
    return images[networkType.toUpperCase() as keyof typeof images];
  }
};

export const getTestNetImageByChainId = (chainId: string) => {
  if (NETWORKS_CHAIN_ID.GOERLI === chainId) {
    return images.GOERLI;
  }
  if (NETWORKS_CHAIN_ID.SEPOLIA === chainId) {
    return images.SEPOLIA;
  }
  if (NETWORKS_CHAIN_ID.LINEA_GOERLI === chainId) {
    return images['LINEA-GOERLI'];
  }
};
