import { MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';
import select from '@inquirer/select';
import * as fs from 'fs';
import chalk from 'chalk';
import {
  batchRequestOperationChoices, batchRequestTypes,
  mainMenuChoices,
  mainMenuChoicesTypes, operationMenuChoices,
  operationsMenuTypes,
} from './menus';
import { batchRequests, chains, personalSignRequest, sendTransactionRequest, switchEthereumChain } from './rpcRequests';
import qrcode from 'qrcode-terminal';


const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'NodeJS example',
    url:  'https://metamask.io',
    iconUrl: 'https://github.com/christopherferreira9/test-assets/blob/61f81895a19a9997438dadc2b938e9e4b2f410c3/icons/nodeJs.png'
  },
  logging: {
    sdk: false,
  },
  checkInstallationImmediately: false,
  modals: {
    install: ({ link }) => {
      qrcode.generate(link, { small: true }, (qr) => console.log(qr));
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
    console.log(`chainChanged: ${chainId}`);
  });

  ethereum.on('accountsChanged', (accounts) => {
    console.log(`accountsChanged: ${accounts}`);
  });

  ethereum.on('disconnect', (error) => {
    console.log(`disconnect: ${error}`);
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

      const newChainId = ethereum.chainId === chains.GOERLI ? chains.MAINNET : chains.GOERLI;
      switchChainSendTransactionBatchRequestRPCs.push(switchEthereumChain(newChainId));
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
          switchEthereumChain(chains.SEPOLIA)
        );
        console.log(`\nSwitch chain result: ${switchChainResult}\n\n`);
      } catch (e) {
        console.log(`\nError: ${e.message}\n\n`);
      }
      break;
    case operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_POLYGON:
      try {
        const switchChainResult = await ethereum.request(
          switchEthereumChain(chains.POLYGON)
        );
        console.log(`\nSwitch chain result: ${switchChainResult}\n\n`);
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
  console.log('Creating or resuming a Session');
  const accounts = await sdk.connect();
  console.log('connect request accounts', accounts);

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
