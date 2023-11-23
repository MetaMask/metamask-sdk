import { useSDK, useSDKConfig } from '@metamask/sdk-ui';
import metamaskSDK from '@web3-onboard/metamask';
import { init, useConnectWallet } from '@web3-onboard/react';
import React from 'react';

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

const OnboardReady = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const handleTestSign = async () => {
    console.log(`TODO: test sign`);
    if (!wallet) {
      console.error(`ethersProvider is undefined`);
      return;
    }

    try {
      const result = await wallet.provider.request({
        method: 'personal_sign',
        params: ['hello world', wallet.accounts?.[0].address],
      });
      console.log(`result: `, result);
    } catch (error) {
      console.error(`error: `, error);
    }
  };

  return (
    <div>
      <div>accounts: {JSON.stringify(wallet?.accounts)}</div>
      <div>chains: {JSON.stringify(wallet?.chains)}</div>
      <button onClick={() => (wallet ? disconnect(wallet) : connect())}>
        {connecting ? 'connecting' : wallet ? 'disconnect' : 'connect'}
      </button>
      <button title="test sign" onClick={handleTestSign}>
        Test Sign
      </button>
    </div>
  );
};

export const Onboard = () => {
  const [onboarded, setOnboarded] = React.useState(false);
  const { sdk } = useSDK();
  const {
    socketServer,
    infuraAPIKey,
    useDeeplink,
    debug,
    checkInstallationImmediately,
  } = useSDKConfig();

  React.useEffect(() => {
    if (onboarded) return;

    const doOnboard = async () => {
      // terminate previous sdk instance
      sdk?.terminate();

      // initialize the module with options
      const metamaskSDKWallet = metamaskSDK({
        options: {
          logging: {
            developerMode: debug,
          },
          infuraAPIKey,
          communicationServerUrl: socketServer,
          useDeeplink,
          checkInstallationImmediately,
          dappMetadata: {
            name: 'DemoDapp Onboard',
            url: window.location.protocol + '//' + window.location.host,
          },
          i18nOptions: {
            enabled: true,
          },
        },
      });
      try {
        await init({
          // ... other Onboard options
          wallets: [
            metamaskSDKWallet,
            //... other wallets
          ],
          chains,
        });
        setOnboarded(true);
      } catch (error) {
        console.error(`error: `, error);
      }
    };

    doOnboard();
  }, []);

  return (
    <div>
      <h1>Web3Onboard Demo</h1>
      {onboarded && <OnboardReady />}
    </div>
  );
};
