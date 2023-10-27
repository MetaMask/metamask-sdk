import { useSDK } from '@metamask/sdk-react';
import { ethers } from 'ethers';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
} from 'viem';
import SimpleABI from '../abi/Simple.json';
import RPCChainViewer, { ChainRPC, ChainRPCs } from '../components/rpcchain-viewer';

export default function Home() {
  const {
    sdk,
    connected,
    connecting,
    balance,
    status: serviceStatus,
    readOnlyCalls,
    extensionActive,
    account,
    provider,
    chainId,
    error,
  } = useSDK();

  const [chainRPCs, setChainRPCs] = useState<ChainRPCs>();
  const languages = sdk?.availableLanguages || ['en'];

  const [response, setResponse] = useState<unknown>('');

  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('MetaMaskSDKLng') || 'en';
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage());

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrentLanguage(event.target.value);
    localStorage.setItem('MetaMaskSDKLng', event.target.value);

    window.location.reload();
  };

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connect:: accounts result`, accounts);
    } catch (err) {
      console.log('request accounts ERR', err);
    }
  };

  const connectAndSign = async () => {
    try {
      const hexResponse = await sdk?.connectAndSign({msg: 'hello world'});
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connectAndSign response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('request accounts ERR', err);
    }
  };

  const sendTransaction = async () => {
    const selectedAddress = provider?.selectedAddress;

    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = (await provider?.request({
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

    setResponse(''); // reset response first
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
      const resp = await provider?.request({ method, params });
      setResponse(resp);
      console.debug(`sign response`, resp);
    } catch (e) {
      console.error(`an error occured`, e);
    }
  };

  const personalSign = async () => {};

  const terminate = () => {
    sdk?.terminate();
  };

  const addNetwork = () => {};

  const interactEthers = async () => {
    // Get value from contract
    const rpcUrl = process.env.NEXT_PUBLIC_PROVIDER_RPCURL;
    const contractAddress = process.env.NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS;
    if (!contractAddress || !rpcUrl) {
      throw new Error(
        'NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS or NEXT_PUBLIC_PROVIDER_RPCURL not set',
      );
    }

    const web3Provider = new ethers.providers.Web3Provider(provider! as any);
    const signer = web3Provider.getSigner();
    console.debug(`signer`, signer);

    const msg = await signer.signMessage('hello world');
    console.debug(`msg`, msg);
    const contract = new ethers.Contract(
      contractAddress,
      SimpleABI.abi,
      signer,
    );

    try {
      const text = await contract.ping();
      console.debug('ping', text);

      const nextValue = `now: ${Date.now()}`;
      console.debug(`Set new contract value to: `, nextValue);
      const trx = await contract.set(nextValue);
      console.debug(`Wait for trx to complete...`);
      await trx.wait();
      console.debug(`Check result...`);
      const text2 = await contract.ping();
      const success = text2 === nextValue;
      console.debug(
        `Check result ==> ${success ? 'SUCCESS' : 'FAILED'} `,
        text2,
      );

      const chainId = provider?.request({ method: 'eth_chainId', params: [] });
      const network = provider?.request({ method: 'net_version', params: [] });
      console.debug(`chainId=${chainId}, network=${network}`);
    } catch (error) {
      console.error('Error pinging ethers:', error);
    }
  };

  const interactViem = async () => {
    const rpcUrl = process.env.NEXT_PUBLIC_PROVIDER_RPCURL;
    const contractAddress = process.env
      .NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS as Address;
    if (!contractAddress || !rpcUrl) {
      throw new Error(
        'NEXT_PUBLIC_SIMPLE_CONTRACT_ADDRESS or NEXT_PUBLIC_PROVIDER_RPCURL not set',
      );
    }

    // const transport = http(rpcUrl);
    const transport = custom(provider!);
    const client = createPublicClient({ transport });
    const wallet = createWalletClient({
      transport,
      account: provider?.selectedAddress! as `0x{string}`,
    });
    try {
      const balance = await client.getBalance({
        address: '0xA9FBbc6C2E49643F8B58Efc63ED0c1f4937A171E',
      });
      console.debug('balance', balance);

      const chainId = await client.getChainId();
      console.debug('chainId', chainId);

      const contract = getContract({
        address: contractAddress,
        abi: SimpleABI.abi,
        publicClient: client,
        walletClient: wallet,
      });

      let text = await contract.read.ping();
      console.debug('ping', text);

      const nextValue = `now: ${Date.now()}`;
      console.debug(`Set new contract value to: `, nextValue);
      const trxHash = await contract.write.set([nextValue], {
        account: provider?.selectedAddress!,
        chain: { id: parseInt(provider?.chainId!) },
      });

      console.debug(`Wait for trx to complete...`);
      // Wait for transaction to be mined
      const trx = await client.waitForTransactionReceipt({
        hash: trxHash,
        confirmations: 1,
      });

      console.debug(`Check result...`);
      text = await contract.read.ping();
      const success = text === nextValue;
      console.debug(
        `Check result ==> ${success ? 'SUCCESS' : 'FAILED'} `,
        text,
      );
    } catch (error) {
      console.error('Error pinging Viem:', error);
    }
  };

  const testEthers = async () => {
    const web3Provider = new ethers.providers.Web3Provider(
      sdk?.getProvider()! as any,
    );
    const signer = web3Provider.getSigner();
    console.debug(`signer`, signer);

    // const addr = await signer.getAddress();
    // console.log('addr', addr);

    const msg = await signer.signMessage('hello world');
    console.debug(`msg`, msg);
  };

  const testPayload = async () => {
    // const res = await provider?.request({
    //   "method": "wallet_addEthereumChain",
    //   "params": [
    //     {
    //       "chainId": "0x1",
    //       "chainName": "Ethereum",
    //       "nativeCurrency": {
    //         "name": "Ethereum",
    //         "symbol": "ETH",
    //         "decimals": 18
    //       },
    //       "rpcUrls": [
    //         "https://rpc.blocknative.com/boost"
    //       ]
    //     }
    //   ]
    // })
    // console.log(`res`, res);
    checkBalances();
  };

  const checkBalances = async () => {
    const acc1 = `0x8e0E30e296961f476E01184274Ce85ae60184CB0`;
    const acc2 = `0xA9FBbc6C2E49643F8B58Efc63ED0c1f4937A171E`;
    const b1 = await provider?.request({
      method: 'eth_getBalance',
      params: [acc1, 'latest'],
    });
    const b2 = await provider?.request({
      method: 'eth_getBalance',
      params: [acc2, 'latest'],
    });

    console.log(`balances`, {
      network: chainId,
      balances: {
        account: b1,
        acc2: b2,
      },
    });
  };

  const testReadOnlyCalls = async () => {
    const chain = await provider?.request({
      method: 'eth_chainId',
      params: [],
    });
    console.log(`chain`, chain);

    const accounts = await provider?.request({
      method: 'eth_accounts',
      params: [],
    });
    console.log(`accounts`, accounts);

    await checkBalances();
  };

  const addGanache = async () => {
    const res = await provider?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x539',
          chainName: 'Ganache Dev',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: [process.env.NEXT_PUBLIC_PROVIDER_RPCURL ?? ''],
        },
      ],
    });
    console.log(`res`, res);
  };

  const handleChainRPCs = async () => {
    const selectedAddress = provider?.selectedAddress;

    const rpcs: ChainRPC[] = [{
      method: "personal_sign",
      params: ["something to sign 1", selectedAddress],
    },
    {
      method: "personal_sign",
      params: ["hello world", selectedAddress],
    },
    {
      method: "personal_sign",
      params: ["Another one #3", selectedAddress],
    }];

    setChainRPCs({processing: true, rpcs});

    let error;
    try {
      const response = await provider?.request({method: 'metamask_batch', params: rpcs}) as any[];
      console.log(`response`, response);
      response.forEach((result, index) => {
        rpcs[index].result = result;
      });
    } catch(e) {
      console.error(`error`, e);
      error = e;
    }
    setChainRPCs({processing: false, rpcs, error})
  };


  const chainSwitchAndSignAndBack = async () => {
    const selectedAddress = provider?.selectedAddress;

    const initChainId = chainId;
    const targetChainId = initChainId === '0x1' ? '0xe704' : '0x1';

    const rpcs: ChainRPC[] = [{
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    },
    {
      method: "personal_sign",
      params: ["Another one #3", selectedAddress],
    },{
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: initChainId }],
    }];

    setChainRPCs({processing: true, rpcs});

    let error;
    try {
      const response = await provider?.request({method: 'metamask_batch', params: rpcs}) as any[];
      console.log(`response`, response);
      response.forEach((result, index) => {
        rpcs[index].result = result;
      });
    } catch(e) {
      console.error(`error`, e);
      error = e;
    }
    setChainRPCs({processing: false, rpcs, error})
  }

  const chainTransactions = async () => {
    const selectedAddress = provider?.selectedAddress;
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    const rpcs: ChainRPC[] = [{
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    },
    {
      method: "personal_sign",
      params: ["Hello Wolrd", selectedAddress],
    },{
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    }];

    setChainRPCs({processing: true, rpcs});

    let error;
    try {
      const response = await provider?.request({method: 'metamask_batch', params: rpcs}) as any[];
      console.log(`response`, response);
      response.forEach((result, index) => {
        rpcs[index].result = result;
      });
    } catch(e) {
      console.error(`error`, e);
      error = e;
    }
    setChainRPCs({processing: false, rpcs, error})
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
        <div className="language-dropdown">
          <label htmlFor="language-select">Language: </label>
          <select
            id="language-select"
            value={currentLanguage}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div id='header'>
          {connecting && (
            <div>Waiting for Metamask to link the connection...</div>
          )}
          {connected &&
            <>
              <table className="head-table">
                <tbody>
                  <tr>
                    <td className="table-label">ChannelId:</td>
                    <td className="table-value">{serviceStatus?.channelConfig?.channelId}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Expiration:</td>
                    <td className="table-value">{serviceStatus?.channelConfig?.validUntil ?? ''}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Extension active:</td>
                    <td className="table-value">{extensionActive ? 'YES' : 'NO'}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Connected chain:</td>
                    <td className="table-value">{chainId}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Connected account:</td>
                    <td className="table-value">{account}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Account balance:</td>
                    <td className="table-value">{balance}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Last request response:</td>
                    <td className="table-value">{JSON.stringify(response)}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Connected:</td>
                    <td className="table-value">{connected ? 'YES' : 'NO'}</td>
                  </tr>
                </tbody>
              </table>
            </>
          }
        </div>
        {connected && (
          <>
            <div className='action-buttons'>
              <button style={{ padding: 10, margin: 10 }} onClick={connect}>
                Request Accounts
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                onClick={interactEthers}
              >
                ping (ethers)
              </button>

              <button style={{ padding: 10, margin: 10 }} onClick={interactViem}>
                ping (viem)
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                onClick={eth_signTypedData_v4}
              >
                eth_signTypedData_v4
              </button>

              <button style={{ padding: 10, margin: 10 }} onClick={testPayload}>
                testPayload
              </button>

              <button style={{ padding: 10, margin: 10 }} onClick={testEthers}>
                testEthers
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                onClick={sendTransaction}
              >
                sendTransaction
              </button>

              <button style={{ padding: 10, margin: 10 }} onClick={addGanache}>
                Add Local Ganache Chain
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                onClick={async () => {
                  await provider?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xe704' }],
                  });
                }}
              >
                Switch to linea
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                onClick={async () => {
                  await provider?.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x1' }],
                  });
                }}
              >
                Switch to mainnet
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                className='chain'
                onClick={handleChainRPCs}
              >
                Chain RPC Calls
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                className='chain'
                onClick={chainSwitchAndSignAndBack}
              >
                Chain Switch + sign + switch back
              </button>

              <button
                style={{ padding: 10, margin: 10 }}
                className='chain'
                onClick={chainTransactions}
              >
                Chain sendTransaction + personal_sign + sendTransaction
              </button>
            </div>
            {chainRPCs && <RPCChainViewer chainRPCs={chainRPCs} />}
          </>
        )}
        {connecting && (
          <>
            <div>Connecting...</div>
            <button style={{ padding: 10, margin: 10 }} onClick={connect}>
              Connect
            </button>
            <button style={{ padding: 10, margin: 10 }} onClick={connectAndSign}>
              Connect And Sign
            </button>
          </>
        )}

        {!connecting && readOnlyCalls && (
          <div>
            <button
              style={{ padding: 10, margin: 10, backgroundColor: '#FFFFCC' }}
              onClick={testReadOnlyCalls}
            >
              testReadOnlyCalls
            </button>
          </div>
        )}

        {!connecting && !connected && (
          <div>
            <button style={{ padding: 10, margin: 10 }} onClick={connect}>
              Connect
            </button>
            <button style={{ padding: 10, margin: 10 }} onClick={connectAndSign}>
              Connect And Sign
            </button>
          </div>
        )}

        <button
          style={{ padding: 10, margin: 10, backgroundColor: 'red' }}
          onClick={terminate}
        >
          Terminate
        </button>
        {/* <video autoPlay controls title='testing' loop playsInline style={{border:'1px solid'}}>
          <source type="video/mp4" src="data:video/mp4;base64,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"></source>
          <source type='video/webm' src='data:video/webm;base64,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'/>
        </video>
        <button onClick={async () => {
          // Play above video
          const video = document.querySelector('video');
          await video?.play();
        }}>Play</button> */}
      </main>
    </>
  );
}
