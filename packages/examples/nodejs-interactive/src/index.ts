import * as fs from 'fs';
import { ConnectionStatus, MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';
import qrcode from 'qrcode-terminal';
import 'dotenv/config';
import { chains, ConnectType, connectType, foxLogo, RpcRequest } from './constants';
import {
  addEthereumChain, balanceOf,
  batchRequests,
  getBlockNumber,
  personalSignRequest,
  sendTransactionRequest,
  switchEthereumChain,
  walletRequestPermissions,
} from './rpcRequests';
const term = require('terminal-kit').terminal;

const EVENT_AMOUNT = process.env.EVENT_AMOUNT;

const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'NodeJS Interactive example',
    url:  'https://metamask.io',
    iconUrl: 'https://avatars.githubusercontent.com/u/9950313?s=200&v=4'
  },
  logging: {
    sdk: false,
  },
  enableAnalytics: true,
  checkInstallationImmediately: false,
  infuraAPIKey: process.env.INFURA_API_KEY || '',
  modals: {
    install: ({ link }) => {
      qrcode.generate(link, { small: true }, (qr) => {
        term.clear()
        console.log(`\n\n${qr}\n\n`);
      });
      return {};
    },
    otp: () => {
      return {
        mount() {},
        updateOTPValue: (otpValue) => {
          if (otpValue !== '') {
            console.debug(
              `[CUSTOMIZE TEXT] Choose the following value on your metamask mobile wallet: ${otpValue}`,
            );
          }
        },
      };
    },
  },
};

const sdk = new MetaMaskSDK(options);

let provider: SDKProvider;
let currentChainId: string;
let selectedAddress: string;
let balance: string = '';

let shouldExit = false;
let sessionExists = fs.existsSync('.sdk-comm');

let latestResult = '';
let events = [];

const addEvent = (event: string) => {
  if (events.length > parseInt(EVENT_AMOUNT)) {
    events.shift();
  }
  events.push(event);
}

const attachListeners = (ethereum: SDKProvider) => {
  ethereum.on('chainChanged', (chainId: string) => {
    addEvent(`chainChanged:: ${chainId}\n`);

    currentChainId = chainId;
    renderTable()
  });

  ethereum.on('accountsChanged', async (accounts) => {
    addEvent(`accountsChanged:: ${accounts[0]}\n`);

    selectedAddress = accounts[0];
    updateBalance().then(() => {
      renderTable()
    })
  });

  ethereum.on('connect', async () => {
    provider = sdk.getProvider();
    selectedAddress = provider.getSelectedAddress();
    currentChainId = provider.getChainId();
    updateBalance().then(() => {
      renderTable()
    })
  });
};

const getEventsAsString = () => {
  let eventsString = '';
  events.forEach(event => {
    eventsString += event;
  });

  return eventsString;
}

const renderTable = () => {
  term.clear();
  drawTable()
}

const updateBalance = async () => {
  if (!selectedAddress) return;

  try {
    const balanceResult = await provider.request(balanceOf(selectedAddress));
    balance = balanceResult.toString();
  } catch (error: any) {
    latestResult = `Error: ${error.message}`;
  }
}

const connect = async (type: ConnectType) => {
  switch (type) {
    case connectType.CONNECT_AND_SIGN:
      await sdk.connectAndSign({ msg: 'Connect & Sign message' });
      break;
    case connectType.CONNECT_WITH_CHAIN_SWITCH:
      await sdk.connectWith(switchEthereumChain(chains.LINEA.chainId));
      break;
    case connectType.CONNECT:
      await sdk.connect();
      break;
    case connectType.CONNECT_WITH_ADD_CHAIN:
      await sdk.connectWith(addEthereumChain(chains.POLYGON));
      break;
    default:
      return;
  }

  provider = sdk.getProvider();
  selectedAddress = provider.getSelectedAddress();
  currentChainId = provider.getChainId();

  await updateBalance()
  attachListeners(provider);
  sessionExists = true;
  renderTable();
}

const terminateSDK = () => {
  sdk.terminate()
  sessionExists = false;
  latestResult = ''
  renderTable();
}

const makeAndCallRPCRequest = async (rpc: RpcRequest) => {
  try {
    renderTable();
    const response = await provider.request(rpc);
    latestResult = JSON.stringify(response, null, 2);
    renderTable()
  } catch (e) {
    latestResult = `^RError in ${rpc.method}: \n^W${e.message}\n`
    renderTable()
  }
}

const getMenuOptions = () => {
  return [
    { key: '1', label: 'Connect', action: async () => await connect(connectType.CONNECT) },
    { key: '2', label: 'Connect & Sign', action: async () => await connect(connectType.CONNECT_AND_SIGN) },
    { key: '3', label: 'Connect w/ SwitchChain (to Linea)', action: async () => await connect(connectType.CONNECT_WITH_CHAIN_SWITCH) },
    { key: 'T', label: 'Terminate', action: () => terminateSDK() },
    { key: 'Q', label: 'Quit', action: () => shouldExit = true },
  ];
};

const getConnectedMenuOptions = () => {
  return [
    { key: '1', label: 'wallet_requestPermissions', action: async () => {
        await makeAndCallRPCRequest(walletRequestPermissions())
      }
    },
    { key: '2', label: 'personal_sign', action: async () => {
        await makeAndCallRPCRequest(personalSignRequest(selectedAddress))
      }
    },
    { key: '3', label: 'eth_sendTransaction', action: async () => {
        await makeAndCallRPCRequest(sendTransactionRequest(selectedAddress))
      }
    },
    { key: '4', label: 'wallet_switchEthereumChain -> Polygon', action: async () => {
        await makeAndCallRPCRequest(switchEthereumChain(chains.POLYGON.chainId))
      }
    },
    { key: '5', label: 'wallet_switchEthereumChain -> Sepolia', action: async () => {
        await makeAndCallRPCRequest(switchEthereumChain(chains.SEPOLIA.chainId))
      }
    },
    { key: '6', label: 'wallet_switchEthereumChain -> Mainnet', action: async () => {
        await makeAndCallRPCRequest(switchEthereumChain(chains.MAINNET.chainId))
      }
    },
    { key: '7', label: 'wallet_addEthereumChain -> Polygon', action: async () => {
        await makeAndCallRPCRequest(addEthereumChain(chains.POLYGON))
      }
    },
    { key: '8', label: 'eth_blockNumber (readOnlyCall)', action: async () => {
        await makeAndCallRPCRequest(getBlockNumber())
      }
    },
    { key: '9', label: 'metamask_batch: personal_sign, personal_sign, personal_sign', action: async () => {
        const rpcs = [];
        for (let i = 0; i <= 2; i++) {
          rpcs.push(personalSignRequest(selectedAddress, `Batch message #${i+1}`))
        }
        await makeAndCallRPCRequest(batchRequests(rpcs))
      }
    },
    { key: '10', label: 'metamask_batch: switchChain, personal_sign, switchChain', action: async () => {
        const rpcs = [];
        const originalChain = currentChainId;
        const nextChain = currentChainId === '0x1' ? chains.LINEA.chainId : chains.MAINNET.chainId;

        rpcs.push(switchEthereumChain(nextChain))
        rpcs.push(personalSignRequest(selectedAddress))
        rpcs.push(switchEthereumChain(originalChain))

        await makeAndCallRPCRequest(batchRequests(rpcs))
      }
    },
    { key: 'T', label: 'Terminate', action: () => terminateSDK() },
    { key: 'Q', label: 'Quit', action: () => shouldExit = true },
  ];
};

const getDisplayMenu = () => {
  return sessionExists ? getConnectedMenuOptions() : getMenuOptions();
}

const drawTable = () => {
  // Generate the options string
  let optionsString = 'Options:\n';
  optionsString += '^C-------------------\n'
  getDisplayMenu().forEach(option => {
    optionsString += `^G${option.key}) ^W${option.label}\n`;
  });

  term.table([
    [foxLogo, `CurrentChain: \n^G${currentChainId ?? ''}\n\nAccount: \n^G${selectedAddress ?? ''}\n\nBalance: ^G${balance}\n\nSessionExists: \n^G${sessionExists}\n\n`, 'Events'],
    [optionsString, `Latest result: \n^G${latestResult}`, getEventsAsString()],
  ], {
    hasBorder: true,
    borderAttr: { color: 'blue' } ,
    contentHasMarkup: true,
    textAttr: { bgColor: 'default' },
    firstCellTextAttr: { bgColor: '' },
    firstRowTextAttr: { bgColor: '' },
    firstColumnTextAttr: { bgColor: '' },
    checkerEvenCellTextAttr: { bgColor: '' },
    fit: true,
    // expandToHeight: true,
  });
}

async  function main() {
  term.fullscreen();
  term.clear();
  term.cyan('Interactive Node.js Example Dapp\n');
  if (sessionExists) {
    await sdk.sdkInitPromise;
    attachListeners(sdk.getProvider())
  }
  term.colorRgb(255, 255, 0);

  while (!shouldExit) {
    drawTable()

    // Await user input
    const choice = await term.inputField().promise;

    // Handle user input
    const selectedOption = getDisplayMenu().find(option => option.key === choice.trim());
    term.clear();

    if (selectedOption) {
      selectedOption.action();
    } else {
      term.red('\nInvalid choice. Please select a valid option.\n');
    }
  }

  term.cyan('\n\nExiting...\n\n');
  process.exit();
}

// Run the main function
main().catch(err => {
  term.red(`\nAn error occurred: ${err.message}\n`);
  process.exit(1);
});
