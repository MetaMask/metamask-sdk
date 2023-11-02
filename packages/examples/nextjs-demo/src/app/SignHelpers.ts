import { SDKProvider } from '@metamask/sdk';
import { Buffer } from 'buffer';

export const send_eth_signTypedData_v4 = async (provider: SDKProvider, chainId: string) => {
  const msgParams = JSON.stringify({
    domain: {
      // Defining the chain aka Rinkeby testnet or Ethereum Main Net
      chainId: chainId,
      // Give a user-friendly name to the specific contract you are signing for.
      name: 'Ether Mail',
      // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      // Just lets you know the latest version. Definitely make sure the field name is correct.
      version: '1',
    },

    message: {
      contents: 'Hello, Bob!',
      attachedMoneyInEth: 4.2,
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
    },
    // Refers to the keys of the *types* object below.
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      // Not an EIP712Domain definition
      Group: [
        { name: 'name', type: 'string' },
        { name: 'members', type: 'Person[]' },
      ],
      // Refer to PrimaryType
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
      ],
      // Not an EIP712Domain definition
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    },
  });

  let from = provider?.selectedAddress;

  console.debug(`sign from: ${from}`);
  try {
    if (!from) {
      alert(
        `Invalid account -- please connect using eth_requestAccounts first`,
      );
      return;
    }

    const params = [from, msgParams];
    const method = 'eth_signTypedData_v4';
    console.debug(`ethRequest ${method}`, JSON.stringify(params, null, 4));
    console.debug(`sign params`, params);
    return await provider?.request({ method, params });
  } catch (err) {
    console.log(err);
  }
};

export const send_personal_sign = async (provider: SDKProvider) => {
  try {
    const from = provider.selectedAddress;
    const message = 'Hello World from the NextJS dapp!';
    const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

    const sign = await window.ethereum?.request({
      method: 'personal_sign',
      params: [hexMessage, from, 'Example password'],
    });
    console.log(`sign: ${sign}`);
    return sign;
  } catch (err) {
    console.log(err);
  }
};
