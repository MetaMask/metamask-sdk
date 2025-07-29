import { createMetamaskSDK } from "@metamask/multichain-sdk";

const validCommands = ['connect'];

(async () => {
  try {
    const [, , startType] = process.argv;
    console.debug(`start NodeJS example`);
    const sdk = await createMetamaskSDK({
			dapp: {
        name: "playground",
        url: "https://playground.metamask.io",
      },
		});
    if (!validCommands.includes(startType)) {
      throw new Error("Invalid command");
    }
    if (startType === 'connect') {
      const connected = await sdk.connect(
        ['eip155:137'],
        ['eip155:137:0x1234567890abcdef1234567890abcdef12345678']
      );
      console.log('connect request accounts',  connected);
    }
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();

// import { MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';

// const start = async (startType) => {
//   console.debug(`start NodeJS example`);
//   if (startType === 'connect') {
//     const accounts = await sdk.connect();
//     console.log('connect request accounts', accounts);
//   } else {
//     const hexSign = await sdk.connectAndSign({msg: "Hello from the NodeJS Example!"})
//     console.log('connect and sign', hexSign);
//   }
//   const ethereum = sdk.getProvider();
//   const signResponse = await ethereum.request({
//     method: 'eth_signTypedData_v3',
//     params: [ethereum.getSelectedAddress(), JSON.stringify(msgParams)],
//   });
//   console.log('eth_signTypedData_v3 response', signResponse);
// };
// const startType = process.argv[2];
// start(startType).catch((err) => {
//   console.error(err);
// });

// const msgParams = {
//   types: {
//     EIP712Domain: [
//       { name: 'name', type: 'string' },
//       { name: 'version', type: 'string' },
//       { name: 'chainId', type: 'uint256' },
//       { name: 'verifyingContract', type: 'address' },
//     ],
//     Person: [
//       { name: 'name', type: 'string' },
//       { name: 'wallet', type: 'address' },
//     ],
//     Mail: [
//       { name: 'from', type: 'Person' },
//       { name: 'to', type: 'Person' },
//       { name: 'contents', type: 'string' },
//     ],
//   },
//   primaryType: 'Mail',
//   domain: {
//     name: 'Ether Mail',
//     version: '1',
//     chainId: '0x1',
//     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
//   },
//   message: {
//     from: {
//       name: 'Cow',
//       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
//     },
//     to: {
//       name: 'Bob',
//       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
//     },
//     contents: 'Hello, Bob!',
//   },
// };

// const start = async (startType) => {
//   console.debug(`start NodeJS example`);

//   if (startType === 'connect') {
//     const accounts = await sdk.connect();
//     console.log('connect request accounts', accounts);
//   } else {
//     const hexSign = await sdk.connectAndSign({msg: "Hello from the NodeJS Example!"})
//     console.log('connect and sign', hexSign);
//   }

//   const ethereum = sdk.getProvider();

//   const signResponse = await ethereum.request({
//     method: 'eth_signTypedData_v3',
//     params: [ethereum.getSelectedAddress(), JSON.stringify(msgParams)],
//   });

//   console.log('eth_signTypedData_v3 response', signResponse);
// };

// const startType = process.argv[2];

// start(startType).catch((err) => {
//   console.error(err);
// });
