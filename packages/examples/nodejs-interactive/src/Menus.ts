import * as fs from 'fs';
import { Separator } from '@inquirer/select';

export const mainMenuChoicesTypes = {
  CREATE_SESSION: 'createSession',
  RESUME_SESSION: 'resumeSession',
  TERMINATE: 'terminateSession',
  QUIT: 'quit'
}

export const batchRequestTypes = {
  PERSONAL_SIGN_3: 'personalSign3',
  PERSONAL_SIGN_SEND_TRANSACTION: 'personalSignSendTransaction',
  SWITCH_CHAIN_SEND_TRANSACTION: 'switchChainSendTransaction',
}

export const operationsMenuTypes = {
  SEND_TRANSACTION: 'sendTransaction',
  SWITCH_ETHEREUM_CHAIN_SEPOLIA: 'switchEthereumChainSepolia',
  SWITCH_ETHEREUM_CHAIN_POLYGON: 'switchEthereumChainPolygon',
  ADD_ETHEREUM_CHAIN: 'addEthereumChain',
  REQUEST_PERMISSIONS: 'requestPermissions',
  PERSONAL_SIGN: 'personalSign',
  BATCH_REQUEST: 'batchRequest',
  BLOCK_NUMBER: 'blockNumber',
  BACK: 'back',
}

export const sessionExists = fs.existsSync('.sdk-comm');
export const mainMenuChoices = [
  {
    name: mainMenuChoicesTypes.CREATE_SESSION,
    value: mainMenuChoicesTypes.CREATE_SESSION,
    description: 'Deletes a session if it exists and creates a new one',
    disabled: sessionExists,
  },
  {
    name: mainMenuChoicesTypes.RESUME_SESSION,
    value: mainMenuChoicesTypes.RESUME_SESSION,
    description: 'Resumes a session if it exists',
    disabled: !sessionExists,
  },
  {
    name: mainMenuChoicesTypes.TERMINATE,
    value: mainMenuChoicesTypes.TERMINATE,
    description: 'deletes the session if it exists',
    disabled: !sessionExists,
  },
  {
    name: mainMenuChoicesTypes.QUIT,
    value: mainMenuChoicesTypes.QUIT,
    description: 'Quit the program (persists session)',
  },
  new Separator('\n ------- \n'),
];

export const operationMenuChoices = [
    {
      name: operationsMenuTypes.SEND_TRANSACTION,
      value: operationsMenuTypes.SEND_TRANSACTION,
      description: 'Sends a transaction',
    },
    {
      name: operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_SEPOLIA,
      value: operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_SEPOLIA,
      description: 'Switches Chain to Sepolia',
    },
    {
      name: operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_POLYGON,
      value: operationsMenuTypes.SWITCH_ETHEREUM_CHAIN_POLYGON,
      description: 'Switches Chain to Polygon',
    },

    {
      name: operationsMenuTypes.ADD_ETHEREUM_CHAIN,
      value: operationsMenuTypes.ADD_ETHEREUM_CHAIN,
      description: 'Adds Polygon Chain',
    },
    {
      name: operationsMenuTypes.PERSONAL_SIGN,
      value: operationsMenuTypes.PERSONAL_SIGN,
      description: 'Calls personalSign',
    },
    {
      name: operationsMenuTypes.BLOCK_NUMBER,
      value: operationsMenuTypes.BLOCK_NUMBER,
      description: 'Calls blockNumber via Infura direct call is infuraApiKey is set',
    },
    {
      name: operationsMenuTypes.BATCH_REQUEST,
      value: operationsMenuTypes.BATCH_REQUEST,
      description: 'Starts to build a batch request',
    },
    {
      name: mainMenuChoicesTypes.TERMINATE,
      value: mainMenuChoicesTypes.TERMINATE,
      description: 'deletes the session if it exists',
      disabled: !sessionExists,
    },
    {
      name: mainMenuChoicesTypes.QUIT,
      value: mainMenuChoicesTypes.QUIT,
      description: 'Quit the program',
    },
  new Separator('\n ------- \n'),
];

export const batchRequestOperationChoices = [
  {
    name: batchRequestTypes.PERSONAL_SIGN_3,
    value: batchRequestTypes.PERSONAL_SIGN_3,
    description: 'Performs personalSign 3 times',
  },
  {
    name: batchRequestTypes.PERSONAL_SIGN_SEND_TRANSACTION,
    value: batchRequestTypes.PERSONAL_SIGN_SEND_TRANSACTION,
    description: 'Performs personalSign and sendTransaction',
  },
  {
    name: batchRequestTypes.SWITCH_CHAIN_SEND_TRANSACTION,
    value: batchRequestTypes.SWITCH_CHAIN_SEND_TRANSACTION,
    description: 'Performs switchEthereumChain and sendTransaction',
  },
  new Separator('\n ------- \n'),
];


