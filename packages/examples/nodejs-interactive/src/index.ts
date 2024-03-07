import { MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';
import select from '@inquirer/select';
import * as fs from 'fs';
import qrcode from 'qrcode-terminal';
import 'dotenv/config';
import {
  batchRequestOperationChoices, batchRequestTypes,
  mainMenuChoices,
  mainMenuChoicesTypes, operationMenuChoices,
  operationsMenuTypes,
} from './Menus';
import {
  addPolygonChain,
  batchRequests,
  getBlockNumber,
  personalSignRequest,
  sendTransactionRequest,
  switchEthereumChain,
} from './RpcRequests';
import { chains } from './Constants';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'NodeJS example',
    url:  'https://metamask.io',
    iconUrl: 'https://avatars.githubusercontent.com/u/9950313?s=200&v=4'
  },
  logging: {
    sdk: false,
  },
  checkInstallationImmediately: false,
  infuraAPIKey: process.env.INFURA_API_KEY || '',
  modals: {
    install: ({ link }) => {
      qrcode.generate(link, { small: true }, (qr) => {
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
let ethereum: SDKProvider;

const attachListeners = (ethereum: SDKProvider) => {
  ethereum.on('chainChanged', (chainId) => {
    if (LOG_LEVEL === 'debug') {
      console.log(`chainChanged: ${chainId}`);
    }
  });

  ethereum.on('accountsChanged', (accounts) => {
    if (LOG_LEVEL === 'debug') {
      console.log(`accountsChanged: ${accounts}`);
    }
  });

  ethereum.on('disconnect', (error) => {
    if (LOG_LEVEL === 'debug') {
      console.log(`disconnect: ${error}`);
    }
  });
};

const presentAndSelectMainMenu = async () => {
  const mainMenuChoice = await select({
    message: 'Select an option to get started',
    choices: mainMenuChoices,
  });

  switch (mainMenuChoice) {
    case mainMenuChoicesTypes.CREATE_SESSION:
      await createSession();
      break;
    case mainMenuChoicesTypes.RESUME_SESSION:
      await createSession();
      break;
    case mainMenuChoicesTypes.TERMINATE:
      await terminateSession()
      process.exit();
  }
}

const presentBatchRequestMenu = async () => {
  const batchRequestMenuChoices = await select({
    message: 'Select batch requests',
    choices: batchRequestOperationChoices,
  });

  switch (batchRequestMenuChoices) {
    case batchRequestTypes.PERSONAL_SIGN_3:
      let personalSignBatchRequestRPCs = [];
      for (let i = 0; i < 3; i++) {
        personalSignBatchRequestRPCs.push(personalSignRequest(ethereum.selectedAddress));
      }

      try {
        let batchResult = await ethereum.request(
          batchRequests(personalSignBatchRequestRPCs)
        );
        console.log(`\nBatch result: ${batchResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }

      break;
    case batchRequestTypes.PERSONAL_SIGN_SEND_TRANSACTION:
      let personalSignSendTransactionBatchRequestRPCs = [];

      personalSignSendTransactionBatchRequestRPCs.push(personalSignRequest(ethereum.selectedAddress));
      personalSignSendTransactionBatchRequestRPCs.push(sendTransactionRequest(ethereum.selectedAddress));
      try {
        let batchResult = await ethereum.request(
          batchRequests(personalSignSendTransactionBatchRequestRPCs)
        );
        console.log(`\nBatch result: ${batchResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }

      break;
    case batchRequestTypes.SWITCH_CHAIN_SEND_TRANSACTION:
      let switchChainSendTransactionBatchRequestRPCs = [];

      if (ethereum.chainId === chains.SEPOLIA.chainId) {
        console.log(`Active chain is Sepolia already. Switching to mainnet first to then do the proper batch`);
        try {
          let switchChainResult = await ethereum.request(
            switchEthereumChain(chains.MAINNET.chainId)
          );
          console.log(`\nSwitch chain result: ${switchChainResult}\n\n`);
        } catch (e) {
          console.log(`\nError: ${e.message}\n\n`);
          return;
        }
      }

      switchChainSendTransactionBatchRequestRPCs.push(switchEthereumChain(chains.SEPOLIA.chainId));
      switchChainSendTransactionBatchRequestRPCs.push(sendTransactionRequest(ethereum.selectedAddress));

      try {
        let batchResult = await ethereum.request(
          batchRequests(switchChainSendTransactionBatchRequestRPCs)
        );
        console.log(`\nBatch result: ${batchResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
  }
}

const presentAndSelectOperationsMenu = async () => {
  const operationsMenuChoice = await select({
    message: 'Select an operation',
    choices: operationMenuChoices,
  });

  switch (operationsMenuChoice) {
    case operationsMenuTypes.SEND_TRANSACTION:
      try {
        const sendTransactionResult = await ethereum.request(
          sendTransactionRequest(ethereum.selectedAddress)
        );
        console.log(`\nTransaction result: ${sendTransactionResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.PERSONAL_SIGN:
      try {
        const personalSignResult = await ethereum.request(
          personalSignRequest(ethereum.selectedAddress)
        );
        console.log(`\nPersonalSign result: ${personalSignResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_SEPOLIA:
      try {
        const switchChainResult = await ethereum.request(
          switchEthereumChain(chains.SEPOLIA.chainId)
        );
        console.log(`\nSwitch chain result: ${switchChainResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.ADD_ETHEREUM_CHAIN:
      try {
        const addChainResult = await ethereum.request(
          addPolygonChain()
        );
        console.log(`\nAdd chain result: ${addChainResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_POLYGON:
      try {
        const switchChainResult = await ethereum.request(
          switchEthereumChain(chains.POLYGON.chainId)
        );
        console.log(`\nSwitch chain result: ${switchChainResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.BLOCK_NUMBER:
      try {
        const blockNumber = await ethereum.request(getBlockNumber());
        const gotFrom = sdk.hasReadOnlyRPCCalls() ? 'infura direct calls' : 'MetaMask (Wallet) provider';
        console.log(`\nBlock number from ${gotFrom}: ${blockNumber}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.BATCH_REQUEST:
      await presentBatchRequestMenu();
      break;
    case mainMenuChoicesTypes.TERMINATE:
      await terminateSession()
      break;
    case mainMenuChoicesTypes.QUIT:
      console.log(`quitting...`);
      process.exit();
  }
}

const createSession = async () => {
  console.log('\nCreating or resuming a Session\n\n');
  const accounts = await sdk.connect();
  console.log(`Connected accounts ${accounts}`);

  ethereum = sdk.getProvider();
  attachListeners(ethereum);
}

const terminateSession = async () => {
  console.log('Terminating the session...');
  sdk.terminate();

  if (fs.existsSync('.sdk-comm')) {
    fs.unlinkSync('.sdk-comm');
  }
}

const start = async () => {
  let shouldFinish = false;

  while (!shouldFinish) {
    await presentAndSelectMainMenu();

    let fileExists = fs.existsSync('.sdk-comm');
    while (fileExists) {
      await presentAndSelectOperationsMenu();
    }
  }
};

start().catch((err) => {
  console.error(err);
});
