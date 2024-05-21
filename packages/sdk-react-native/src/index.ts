import MetaMaskProvider, { SDKContext, SDKState } from './MetaMaskProvider';
import {
  SDKConfigProvider,
  SDKConfigProviderProps,
  SDKConfigContext,
  SDKConfigContextProps,
} from './SDKConfigProvider';

export * from './MetaMaskHooks';
import { NativeModules } from 'react-native';
const { MetaMaskReactNativeSdk } = NativeModules;

const connect = async () => {
  try {

    const options = {
      dappName: 'My DApp',
      dappUrl: 'https://mydapp.com',
      dappIconUrl: 'https://mydapp.com/icon',
      dappScheme: 'mydapp',
      infuraAPIKey: '1234567890abcdef',
    };

    console.log("🟠 ~ file: index.ts:24 ~ INIT START", )
    MetaMaskReactNativeSdk.initialize(options);

    console.log("🟠 ~ file: index.ts:27 ~ connect START", )
    const res = await MetaMaskReactNativeSdk.connect();
    console.log("🟠 ~ file: index.ts:29 ~ connect ~ res:", res)
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
  }
}

const options = {
  dappName: 'My DApp',
  dappUrl: 'https://mydapp.com',
  dappIconUrl: 'https://mydapp.com/icon',
  dappScheme: 'mydapp',
  infuraAPIKey: '1234567890abcdef',
};


const connectAndSign = async (message: string) => {
  console.log('Initializing...');
  MetaMaskReactNativeSdk.initialize(options);

  MetaMaskReactNativeSdk.connectAndSign(message)
    .then((result:any) => {
      console.log('Got result!', result);
    })
    .catch((error: any) => {
      console.error('Error:', error);
    });
};

const connectWith = async (req: any) => {
  console.log('Initializing...');
  MetaMaskReactNativeSdk.initialize(options);

  MetaMaskReactNativeSdk.connectWith(req)
  .then((result: any) => {
      console.log('Got result!', result);
    })
    .catch((error: any) => {
      console.error('Error:', error);
    });
};


const request = async (message: any) => {
  MetaMaskReactNativeSdk.request(message)
  .then((result: any) => {
  console.log('Got result!', result);
  })
  .catch((error: any) => {
    console.error('Error:', error);
  });
};

const batchRequest = async (requests: any) => {
  MetaMaskReactNativeSdk.batchRequest(requests)
  .then((result: any) => {
  console.log('Got result!', result);
  })
  .catch((error: any) => {
    console.error('Error:', error);
  });
};

const disconnect = async () => {
  MetaMaskReactNativeSdk.disconnect()
  .then((result: any) => {
  console.log('Got result!', result);
  })
  .catch((error: any) => {
    console.error('Error:', error);
  });
};


export type {
  SDKConfigProviderProps,
  SDKState,
  SDKConfigContextProps,
};

export {
  disconnect,
  connect,
  connectAndSign,
  connectWith,
  request,
  batchRequest,
  MetaMaskProvider,
  SDKContext,
  SDKConfigProvider,
  SDKConfigContext,
};
