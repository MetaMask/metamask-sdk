import { MetaMaskSDK } from '../../../sdk';
import { RPC_URLS_MAP } from './setupReadOnlyRPCProviders';

export const setupInfuraProvider = async (instance: MetaMaskSDK) => {
  const { options } = instance;
  const { infuraAPIKey } = options;

  if (!infuraAPIKey) {
    return;
  }

  const infuraRpcUrls: RPC_URLS_MAP = {
    // ###### Ethereum ######
    // Mainnet
    '0x1': `https://mainnet.infura.io/v3/${infuraAPIKey}`,
    // Goerli
    '0x5': `https://goerli.infura.io/v3/${infuraAPIKey}`,
    // Sepolia 11155111
    '0xaa36a7': `https://sepolia.infura.io/v3/${infuraAPIKey}`,
    // ###### Linea ######
    // Mainnet Alpha
    '0xe708': `https://linea-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Testnet ( linea goerli )
    '0xe704': `https://linea-goerli.infura.io/v3/${infuraAPIKey}`,
    // ###### Polygon ######
    // Mainnet
    '0x89': `https://polygon-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Mumbai
    '0x13881': `https://polygon-mumbai.infura.io/v3/${infuraAPIKey}`,
    // ###### Optimism ######
    // Mainnet
    '0x45': `https://optimism-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Goerli
    '0x1a4': `https://optimism-goerli.infura.io/v3/${infuraAPIKey}`,
    // ###### Arbitrum ######
    // Mainnet
    '0xa4b1': `https://arbitrum-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Goerli
    '0x66eed': `https://arbitrum-goerli.infura.io/v3/${infuraAPIKey}`,
    // ###### Palm ######
    // Mainnet
    '0x2a15c308d': `https://palm-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Testnet
    '0x2a15c3083': `https://palm-testnet.infura.io/v3/${infuraAPIKey}`,
    // ###### Avalanche C-Chain ######
    // Mainnet
    '0xa86a': `https://avalanche-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Fuji
    '0xa869': `https://avalanche-fuji.infura.io/v3/${infuraAPIKey}`,
    // // ###### NEAR ######
    // // Mainnet
    // '0x4e454152': `https://near-mainnet.infura.io/v3/${infuraAPIKey}`,
    // // Testnet
    // '0x4e454153': `https://near-testnet.infura.io/v3/${infuraAPIKey}`,
    // ###### Aurora ######
    // Mainnet
    '0x4e454152': `https://aurora-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Testnet
    '0x4e454153': `https://aurora-testnet.infura.io/v3/${infuraAPIKey}`,
    // ###### StarkNet ######
    // Mainnet
    '0x534e5f4d41494e': `https://starknet-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Goerli
    '0x534e5f474f45524c49': `https://starknet-goerli.infura.io/v3/${infuraAPIKey}`,
    // Goerli 2
    '0x534e5f474f45524c4932': `https://starknet-goerli2.infura.io/v3/${infuraAPIKey}`,
    // ###### Celo ######
    // Mainnet
    '0xa4ec': `https://celo-mainnet.infura.io/v3/${infuraAPIKey}`,
    // Alfajores Testnet
    '0xaef3': `https://celo-alfajores.infura.io/v3/${infuraAPIKey}`,
  };

  // should we enable check if infura apiKey is valid?
  // try {
  //   const response = await rpcRequestHandler({
  //     // chainId: '0x1',
  //     rpcEndpoint: infuraRpcUrls['0x1'],
  //     method: 'net_version',
  //     params: [],
  //   });
  //   if (instance.debug) {
  //     console.debug(
  //       `[setupInfuraProvider] test infuraApiKey=${infuraAPIKey} response:`,
  //       response,
  //     );
  //   }
  // } catch (err) {
  //   throw new Error(`Invalid Infura Settings`);
  // }

  if (instance.options.readonlyRPCMap) {
    // add infura rpc urls to readonlyRPCMap
    instance.options.readonlyRPCMap = {
      ...instance.options.readonlyRPCMap,
      ...infuraRpcUrls,
    };
  } else {
    instance.options.readonlyRPCMap = infuraRpcUrls;
  }
};
