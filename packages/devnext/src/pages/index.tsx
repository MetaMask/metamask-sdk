import React from 'react';
import { useSDK } from '@metamask/sdk-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import SimpleABI from '../abi/Simple.json'
import { Address, createPublicClient, getContract, http } from 'viem'
import { ethers } from 'ethers'

export default function Home() {
  const {
    sdk,
    connected,
    connecting,
    status: serviceStatus,
    account,
    chainId,
    error,
  } = useSDK();
  const [response, setResponse] = useState<unknown>('');

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connect:: accounts result`, accounts);
    } catch (err) {
      console.log('request accounts ERR', err)
    }
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: window.ethereum?.selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = (await window.ethereum?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })) as string;

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const eth_signTypedData_v4 = async () => {
    const msgParams = JSON.stringify({
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: parseInt(window.ethereum?.chainId ?? '', 16),
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Ether Mail',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },

      // Defining the message signing data content.
      message: {
        /*
         - Anything you want. Just a JSON Blob that encodes the data you want to send
         - No required fields
         - This is DApp Specific
         - Be as explicit as possible when building out the message schema.
        */
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
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
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

    let from = window.ethereum?.selectedAddress;

    console.debug(`sign from: ${from}`);
    try {
      if (!from || from === null) {
        alert(
          `Invalid account -- please connect using eth_requestAccounts first`,
        );
        return;
      }

      const params = [from, msgParams];
      const method = 'eth_signTypedData_v4';
      console.debug(`ethRequest ${method}`, JSON.stringify(params, null, 4));
      console.debug(`sign params`, params);
      const resp = await window.ethereum?.request({ method, params });
      setResponse(resp);
    } catch (e) {
      console.log(e);
    }
  };

  const personalSign = async () => { };

  const terminate = () => {
    sdk?.terminate();
  };

  const addNetwork = () => {

  }

  const pingEthers = async () => {
    // Get value from contract
    const rpcUrl = process.env.NEXT_PUBLIC_PROVIDER_RPCURL;
    const contractAddress = process.env.NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS;
    if (!contractAddress || !rpcUrl) {
      throw new Error('NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS or NEXT_PUBLIC_PROVIDER_RPCURL not set')
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, SimpleABI.abi, provider);

    try {
      const text = await contract.ping();
      console.debug('ping', text);

      const network = await provider.getNetwork();
      console.debug('Network', network);
    } catch (error) {
      console.error('Error pinging ethers:', error);
    }
  }

  const queryBalance = async () => {
    const ethersProvider = new ethers.providers.Web3Provider(
      sdk?.getProvider() as any,
      'any'
    )
    const signer = ethersProvider.getSigner()

    const erc20ABISubset = [
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function'
      }
    ]

    // const callData = {
    //   "method": "eth_call",
    //   "params": [
    //     {
    //       "from": "0x8e0e30e296961f476e01184274ce85ae60184cb0",
    //       "to": "0x111111111117dc0aa78b770fa6a738034120c302",
    //       "data": "0x70a082310000000000000000000000008e0e30e296961f476e01184274ce85ae60184cb0"
    //     },
    //     "latest"
    //   ]
    // }
    const swapContract = new ethers.Contract(
      '0x111111111117dc0aa78b770fa6a738034120c302',
      erc20ABISubset,
      signer
    )
    try {
      const bigNumBalance = await swapContract.balanceOf(account)
      const tokenName = await swapContract.symbol()

      console.debug(`Balance of ${tokenName}: ${bigNumBalance.toString()}`)
    } catch(err) {
      console.error(`Error querying balance`, err)
    }

  }

  const pingViem = async () => {
    const rpcUrl = process.env.NEXT_PUBLIC_PROVIDER_RPCURL;
    const contractAddress = process.env.NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS as Address;
    if (!contractAddress || !rpcUrl) {
      throw new Error('NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS or NEXT_PUBLIC_PROVIDER_RPCURL not set')
    }

    const transport = http(rpcUrl);
    const client = createPublicClient({ transport });
    try {
      const balance = await client.getBalance({ address: '0xA9FBbc6C2E49643F8B58Efc63ED0c1f4937A171E' });
      console.debug('balance', balance);

      const chainId = await client.getChainId();
      console.debug('chainId', chainId);

      const contract = getContract({
        address: contractAddress,
        abi: SimpleABI.abi,
        publicClient: client,
      });

      const text = await contract.read.ping();
      console.debug('ping', text);
    } catch (error) {
      console.error('Error pinging Viem:', error);
    }
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <Link href={'uikit'}>UI Kit demo</Link>
      </header>
      <main>
        {connecting && (
          <div>Waiting for Metamask to link the connection...</div>
        )}
        <p>ChannelId: {serviceStatus?.channelConfig?.channelId}</p>
        <p>{`Expiration: ${serviceStatus?.channelConfig?.validUntil ?? ''}`}</p>

        <div>{`Connected: ${connected}`}</div>
        {connected ? (
          <div>
            <div>
              {`Connected chain: ${chainId}`}
              <p></p>
              {`Connected account: ${account}`}
              <p></p>
              {`Last request response: ${response}`}
            </div>

            <button style={{ padding: 10, margin: 10 }} onClick={connect}>
              Request Accounts
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={queryBalance}
            >
              Query Contract
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={pingEthers}
            >
              ping (ethers)
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={pingViem}
            >
              ping (viem)
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={eth_signTypedData_v4}
            >
              eth_signTypedData_v4
            </button>

            <button
              style={{ padding: 10, margin: 10 }}
              onClick={sendTransaction}
            >
              sendTransaction
            </button>
          </div>
        ) : connecting ? <>
          <div>Connecting...</div>
          <button style={{ padding: 10, margin: 10 }} onClick={connect}>
            Connect
          </button>
        </> : (
          <button style={{ padding: 10, margin: 10 }} onClick={connect}>
            Connect
          </button>
        )}

        <button
          style={{ padding: 10, margin: 10, backgroundColor: 'red' }}
          onClick={terminate}
        >
          Terminate
        </button>
      </main>
    </>
  );
}
