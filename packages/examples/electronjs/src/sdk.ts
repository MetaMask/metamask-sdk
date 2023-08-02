import { MetaMaskSDK, SDKProvider } from '@metamask/sdk';

import QRCode from 'qrcode';
import { Buffer } from 'buffer';
import { existsSync } from 'fs';

// MetaMask SDK
const sdk = new MetaMaskSDK({
  shouldShimWeb3: false,
  storage: {
    enabled: true,
  },
  dappMetadata: {
    name: 'Electron Test Dapp',
    url: 'https://metamask.io/sdk/',
  },
  modals: {
    install: ({ link }) => {
      QRCode.toCanvas(qrCodeDOM, link, (error: any) => {
        if (error) console.error(error)
      })
      return {};
    },
    otp: () => {
      return {
        updateOTPValue: (otpValue) => {
          if (otpValue !== '') {
            otpDOM.innerText = otpValue;
          }
        },
      };
    },
  },
});


// DOM Elements
const qrCodeDOM = document.getElementById('qrCode');
const otpDOM = document.getElementById('otp');
const signButtonDOM = document.getElementById('signButton');
const connectButtonDOM = document.getElementById('connectButton');
const terminateButtonDOM = document.getElementById('terminateButton');
const responseDOM = document.getElementById('response');
const accountsDOM = document.getElementById('account');
const chainDOM = document.getElementById('chain');

// App State
let account = ''
let chainId = ''
let response = ''
let ethereum: SDKProvider;


// SDK Functions

// Connect
const connect = async () => {
  await ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts) => {
      account = accounts?.[0];
      updateDOM(accountsDOM, account);
      connectButtonDOM.textContent = 'Connected';
      qrCodeDOM.style.display = 'none';
      chainId = ethereum.chainId;
      updateDOM(chainDOM, chainId);
      signButtonDOM.style.display = 'inline';
    })
    .catch((error) => {
      console.error(error);
    });
};

// Sign
const sign = async () => {
  const from = ethereum.selectedAddress;
  const message = 'Hello World from the Electron Example dapp!';
  const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');
  ethereum.request({
    method: 'personal_sign',
    params: [hexMessage, from, 'Example password'],
  }).then((result) => {
    response = result as string;
    updateDOM(responseDOM, result.toString());
    console.log('sign', result);
  }).catch((e) => console.log('sign ERR', e));
};

// Terminate
const terminate = () => {
  sdk.terminate();
  connectButtonDOM.textContent = 'Connect';
  signButtonDOM.style.display = 'none';
  accountsDOM.innerText = '';
  chainDOM.innerText = '';
  qrCodeDOM.innerText = '';
  otpDOM.innerText = '';
  responseDOM.innerText = '';
}


// Event listeners
connectButtonDOM.onclick = connect;
connectButtonDOM.addEventListener('click', connect);
signButtonDOM.addEventListener('click', sign);
terminateButtonDOM.addEventListener('click', terminate);


// Entry point
window.onload = async () => {
  await sdk.init();
  ethereum = sdk.getProvider();
  setEventListeners();
  if(hasSessionStored()) {
    connectButtonDOM.innerText = 'Reconnecting...';
    await connect();
  }
}

const setEventListeners = () => {
  ethereum.on('chainChanged', (chain: string) => {
    console.log(`chainChanged ${chain}`);
    chainId = chain;
    updateDOM(chainDOM, chain);
  });

  ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length === 0) {
      updateDOM(accountsDOM, 'Accounts disconnected!')
      return;
    }
    console.log(`accountsChanged ${accounts}`);
    account = accounts[0];
    updateDOM(accountsDOM, accounts[0]);
  });

  ethereum.on('connect', () => {
    qrCodeDOM.innerText = '';
    if (account !== '') {
      updateDOM(otpDOM, '');
    }
  });
};

// Helper functions
function updateDOM(domElement: HTMLElement, value: string){
  domElement.innerText = value;
}

function hasSessionStored() {
  return existsSync('.sdk-comm');
}
