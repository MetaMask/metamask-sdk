import { MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';
import * as fs from 'fs';

const qrcode = require('qrcode-terminal');

const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'NodeJS example',
    base64Icon: '000'
  },
  // Optional: customize modal text
  modals: {
    install: ({ link }) => {
      qrcode.generate(link, { small: true }, (qr) => console.log(qr));
      return {
        onClose() {
          // nothing to do.
        },
      };
    },
    otp: () => {
      return {
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

const start = async (ethereum: SDKProvider) => {
  console.debug(`start dapp example`);

  const accounts = await ethereum.request({
    method: 'eth_requestAccounts',
    params: [],
  });

  console.log('request accounts', accounts);

  const msgParams = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: '0x1',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  const from = accounts?.[0];

  const signResponse = await ethereum.request({
    method: 'eth_signTypedData_v3',
    params: [from, JSON.stringify(msgParams)],
  });

  console.log('sign response', signResponse);
};

sdk
  .init()
  .then(() => {
    const ethereum = sdk.getProvider();

    const persistenceFileName = '.sdk-comm';

    if (options.storage?.enabled && fs.existsSync(persistenceFileName)) {
      console.debug(
        `Please open linked MetaMask mobile wallet for OTP or delete file '${persistenceFileName}' and scan QRCode.`,
      );
    }

    ethereum.on('_initialized', () => {
      start(ethereum);
    });

    ethereum.request({
      method: 'eth_requestAccounts',
      params: [],
    });
  })
  .catch((error) => {
    console.error(`sdk init error`, error);
  });
