import metamaskSDK from '@web3-onboard/metamask';
import { init, useConnectWallet } from '@web3-onboard/react';

import './App.css';

interface RPCError {
  code: number;
  message: string;
}

const chains = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: `https://rpc.ankr.com/eth`,
  },
  {
    id: '0xa',
    token: 'ETH',
    label: 'Optimism',
    rpcUrl: 'https://rpc.ankr.com/optimism',
  },
  {
    id: '0x2105',
    token: 'ETH',
    label: 'Base',
    rpcUrl: 'https://mainnet.base.org',
  },
  {
    id: '0xa4b1',
    token: 'ETH',
    label: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  {
    id: '0xfa',
    token: 'FTM',
    label: 'Fantom',
    rpcUrl: 'https://rpc.fantom.network',
  },
  {
    id: '0x38',
    token: 'BNB',
    label: 'Binance Smart Chain',
    rpcUrl: `https://bsc-dataseed.binance.org`,
  },
  {
    id: '0x89',
    token: 'MATIC',
    label: 'Matic Mainnet',
    rpcUrl: 'https://matic-mainnet.chainstacklabs.com',
  },
  {
    id: '0xa86a',
    token: 'AVAX',
    label: 'Avalanche Mainnet',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
  {
    id: '0xa4ec',
    token: 'CELO',
    label: 'Celo Mainnet',
    rpcUrl: 'https://rpc.ankr.com/celo',
  },
  {
    id: '0x64',
    token: 'XDAI',
    label: 'Gnosis Chain',
    rpcUrl: 'https://rpc.gnosischain.com/',
  },
  {
    id: '0x44d',
    token: 'ETH',
    label: 'Polygon zkEVM',
    rpcUrl: 'https://zkevm-rpc.com',
  },
  {
    id: '0xe708',
    token: 'ETH',
    label: 'Linea',
    rpcUrl: 'https://linea.drpc.org',
  },
  {
    id: '0x1388',
    token: 'MNT',
    label: 'Mantle',
    rpcUrl: 'https://rpc.mantle.xyz',
  },
];

// initialize the module with options
const metamaskSDKWallet = metamaskSDK({options: {
  extensionOnly: false,
  logging: {
    developerMode: true,
  },
  dappMetadata: {
    name: 'Demo Web3Onboard'
  }
}})

init({
  // ... other Onboard options
  wallets: [
    metamaskSDKWallet
    //... other wallets
  ],
  chains
});

function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  const handleTestSign = async () => {
    console.log(`TODO: test sign`)
    if(!wallet) {
      console.error(`ethersProvider is undefined`)
      return
    }

    try {
      const result = await wallet.provider.request({method: 'personal_sign', params: ['hello world', wallet.accounts?.[0].address]})
      console.log(`result: `, result)
    } catch (error) {
      console.error(`error: `, error)
    }
  }

  const addEthereumChain = async () => {
    wallet.provider
      .request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: { symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
          },
        ],
      })
      .then(() => {
        const confirmation = document.getElementById('confirmation');
        confirmation!.style.display = 'block';
        confirmation!.innerText = "Polygon has been added to MetaMask.";
      })
      .catch((error: unknown) => {
        console.log(`error: `, error);
      });
  }

  const switchChain = async (hexChainId: string) => {
    try {
      const result = await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
      });
      console.log(`result: `, result)
    } catch (err: unknown) {
      const error = err as RPCError;
      console.log(typeof error)
      console.log(error);
      if (error.code === -32603) {
        const confirmation = document.getElementById('confirmation');
        confirmation!.style.display = 'block';
      }
    }
  }

  return (
    <>
    <div>
      accounts: {JSON.stringify(wallet?.accounts)}
    </div>
    <div>
      chains: {JSON.stringify(wallet?.chains)}
    </div>
     <button
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
      </button>
      <button  title='test sign' onClick={handleTestSign}>Test Sign</button>
      <div>
        <button title='Add Polygon' id={'addPolygonButton'} onClick={() => switchChain('0x89')}>Switch to Polygon</button>
        <div id={'confirmation'}>
          <p>MetaMask doesn't have Polygon, do you want to add it?</p>
          <button title='Add Polygon' id={'addPolygonButtonConfirmation'} onClick={addEthereumChain}>Add Polygon</button>
        </div>
      </div>
    </>
  )
}

export default App
