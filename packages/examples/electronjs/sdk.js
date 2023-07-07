const { MetaMaskSDK } = require('@metamask/sdk');
const QRCode = require('qrcode');
const { Buffer } = require('buffer');
const {existsSync} = require('fs');

// DOM Elements
const qrCodeDOM = document.getElementById('qrCode');
const otpDOM = document.getElementById('otp');
const otpContainerDOM = document.getElementById('otpContainer');
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

// Event listeners
connectButtonDOM.addEventListener('click', connect);
signButtonDOM.addEventListener('click', sign);
terminateButtonDOM.addEventListener('click', terminate);

window.onload = async () => {
  if(hasSessionStored()) {
    connectButtonDOM.innerText = 'Reconnecting...';
    connect();
  }
}

// SDK Options
const options = {
  shouldShimWeb3: false,
  storage: {
    enabled: true,
  },
  dappMetadata: {
    name: 'Electron Test Dapp',
    url: 'Electron Test Dapp',
  },
  modals: {
    install: ({ link }) => {
      QRCode.toCanvas(qrCode, link,function (error) {
        if (error) console.error(error)
        console.log('success!');
      })
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
};

// SDK init
const sdk = new MetaMaskSDK(options);

const ethereum = sdk.getProvider();

// Ethereum Event listeners
ethereum.on('chainChanged', (chain) => {
  console.log(`chainChanged ${chain}`);
  chainId = chain;
  updateDOM(chainDOM, chain);
});

ethereum.on('accountsChanged', (accounts) => {
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

function  connect(otp){
  sdk.connect().then((accounts) => {
    console.log('done connected ', accounts)
    account = accounts[0];
    updateDOM(accountsDOM, accounts[0]);
    connectButtonDOM.textContent = 'Connected';
    qrCodeDOM.style.display = 'none';
    chainId = ethereum.chainId;
    updateDOM(chainDOM, chainId);
  }).catch((e) => console.log('connect ERR', e));
  signButtonDOM.style.display = 'inline';
}

function sign(){
  const from = ethereum.selectedAddress;
  const message = 'Hello World from the Electron Example dapp!';
  const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');
  ethereum.request({
    method: 'personal_sign',
    params: [hexMessage, from, 'Example password'],
  }).then((result) => {
    response = result;
    updateDOM(responseDOM, result);
    console.log('sign', result);
  }).catch((e) => console.log('sign ERR', e));
}

function terminate() {
  sdk.terminate();
  connectButtonDOM.textContent = 'Connect';
  signButtonDOM.style.display = 'none';
  accountsDOM.innerText = '';
  chainDOM.innerText = '';
  qrCodeDOM.innerText = '';
  otpDOM.innerText = '';
  responseDOM.innerText = '';
}

function updateDOM(domElement, value){
  domElement.innerText = value;
}

function hasSessionStored() {
  return existsSync('.sdk-comm');
}
