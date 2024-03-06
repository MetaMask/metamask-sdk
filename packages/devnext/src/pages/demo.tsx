import { ChainRPC } from '@metamask/sdk-lab';
import { useSDK } from '@metamask/sdk-react';
import { MetaMaskButton, SDKStatus, RPCHistoryViewer } from '@metamask/sdk-ui';
import { ethers } from 'ethers';
import Head from 'next/head';
import { useState } from 'react';
import SimpleABI from '../abi/Simple.json';
import { getSignParams } from '../utils/sign-utils';

const Demo = () => {
  const { sdk, connected, connecting, readOnlyCalls, provider, chainId } =
    useSDK();

  const [response, setResponse] = useState<unknown>('');
  const [rpcError, setRpcError] = useState<unknown>();
  const [requesting, setRequesting] = useState(false);

  const connect = async () => {
    try {
      setRpcError(null);
      setResponse('');

      const accounts = await sdk?.connect();
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connect:: accounts result`, accounts);
      setResponse(accounts);
    } catch (err) {
      console.log('request accounts ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  const connectAndSign = async () => {
    try {
      setRpcError(null);
      setRequesting(true);
      setResponse('');

      const hexResponse = await sdk?.connectAndSign({ msg: 'hello world' });
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connectAndSign response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('request accounts ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  const ethAccounts = async () => {
    try {
      setRpcError(null);
      setRequesting(true);
      setResponse('');

      const hexResponse = await provider?.request({
        method: 'eth_accounts',
        params: [],
      });
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`eth_accounts response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('eth_accounts ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  const walletRequest = async () => {
    try {
      setRpcError(null);
      setRequesting(true);
      setResponse('');

      const hexResponse = await provider?.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`wallet_requestPermissions response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('wallet_requestPermissions ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  const getPermissions = async () => {
    try {
      setRpcError(null);
      setRequesting(true);
      setResponse('');

      const hexResponse = await provider?.request({
        method: 'wallet_getPermissions',
        params: [{ eth_accounts: {} }],
      });
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`wallet_getPermissions response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('wallet_getPermissions ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  const sendTransaction = async () => {
    const selectedAddress = provider?.selectedAddress;
    // const selectedAddress = '0x8e0e30e296961f476e01184274ce85ae60184cb0'; // account1

    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };
    setRpcError(null);
    setRequesting(true);
    setResponse(''); // reset response first

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
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const eth_signTypedData_v4 = async () => {
    if (!chainId) {
      throw new Error(`chainId not set`);
    }

    const msgParams = JSON.stringify(getSignParams({ hexChainId: chainId }));
    const from = window.ethereum?.selectedAddress;

    setRequesting(true);
    setRpcError(null);
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
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const personalSign = async () => {
    const from = window.ethereum?.selectedAddress;
    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first
    console.debug(`sign from: ${from}`);
    try {
      if (!from || from === null) {
        alert(
          `Invalid account -- please connect using eth_requestAccounts first`,
        );
        return;
      }

      const params = ['hello world', from];
      const method = 'personal_sign';
      console.debug(`ethRequest ${method}`, JSON.stringify(params, null, 4));
      console.debug(`sign params`, params);
      const resp = await provider?.request({ method, params });
      setResponse(resp);
      console.debug(`sign response`, resp);
    } catch (e) {
      console.error(`an error occured`, e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const terminate = () => {
    sdk?.terminate();
  };

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

  const testEthers = async () => {
    const web3Provider = new ethers.providers.Web3Provider(
      sdk?.getProvider() as any,
    );
    const signer = web3Provider.getSigner();
    console.debug(`signer`, signer);

    // const addr = await signer.getAddress();
    // console.log('addr', addr);

    const msg = await signer.signMessage('hello world');
    console.debug(`msg`, msg);
  };

  const testPayload = async () => {
    const res = await provider?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x1',
          chainName: 'Ethereum',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://rpc.blocknative.com/boost'],
        },
      ],
    });
    console.log(`res`, res);
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

  const addEthereumChain = async () => {
    if (!provider) {
      throw new Error(`invalid ethereum provider`);
    }

    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const response = await provider?.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: { symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
          },
        ],
      });
      console.debug(`response`, response);
      setResponse(response);
    } catch (e) {
      console.log(e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const changeNetwork = async (hexChainId: string) => {
    console.debug(`switching to network chainId=${hexChainId}`);
    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const response = await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
      });
      console.debug(`response`, response);
      setResponse(response);
    } catch (e) {
      console.log(e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const testReadOnlyCalls = async () => {
    try {
      await checkBalances();

      // Following code can only work after the sdk has connected once and saved initial accounts+chainid.
      console.log(`Testing sdk accounts+chainid caching...`);
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
    } catch (err) {
      console.error(`testReadOnlyCalls error`, err);
    }
  };

  const addGanache = async () => {
    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const resp = await provider?.request({
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
      setResponse(resp);
      console.debug(`sign response`, resp);
    } catch (e) {
      console.error(`an error occured`, e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const handleChainRPCs = async () => {
    const selectedAddress = provider?.selectedAddress;

    const rpcs: ChainRPC[] = [
      {
        method: 'personal_sign',
        params: ['something to sign 1', selectedAddress],
      },
      {
        method: 'personal_sign',
        params: ['hello world', selectedAddress],
      },
    ];

    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const response = (await provider?.request({
        method: 'metamask_batch',
        params: rpcs,
      })) as any[];
      setResponse(response);
      console.log(`response`, response);
    } catch (e) {
      console.error(`error`, e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const chainSwitchAndSignAndBack = async () => {
    const selectedAddress = provider?.selectedAddress;

    const initChainId = chainId;
    const targetChainId = initChainId === '0x5' ? '0xe704' : '0x5';

    const rpcs: ChainRPC[] = [
      {
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      },
      {
        method: 'eth_sendTransaction',
        params: [
          {
            to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
            from: provider?.selectedAddress, // must match user's active address.
            value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
          },
        ],
      },
      {
        method: 'personal_sign',
        params: ['Another one #3', selectedAddress],
      },
      {
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: initChainId }],
      },
    ];

    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const response = (await provider?.request({
        method: 'metamask_batch',
        params: rpcs,
      })) as any[];
      setResponse(response);
      console.log(`response`, response);
    } catch (e) {
      console.error(`error`, e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const chainTransactions = async () => {
    const selectedAddress = provider?.selectedAddress;
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: selectedAddress, // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };

    const rpcs: ChainRPC[] = [
      {
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      },
      {
        method: 'personal_sign',
        params: ['Hello Wolrd', selectedAddress],
      },
      {
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      },
    ];

    setRequesting(true);
    setRpcError(null);
    setResponse(''); // reset response first

    try {
      const response = (await provider?.request({
        method: 'metamask_batch',
        params: rpcs,
      })) as any[];
      setResponse(response);
      console.log(`response`, response);
    } catch (e) {
      console.error(`error`, e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const connectWith = async ({
    type,
  }: {
    type:
      | 'PERSONAL_SIGN'
      | 'ETH_SENDTRANSACTION'
      | 'ETH_SIGNTYPEDDATA_V4'
      | 'ETH_CHAINID';
  }) => {
    try {
      setRpcError(null);
      setRequesting(true);
      setResponse('');

      const sendTransactionRpc = {
        method: 'eth_sendTransaction',
        params: [
          {
            to: '0xA9FBbc6C2E49643F8B58Efc63ED0c1f4937A171E', // Required except during contract publications.
            from: '0xMYACCOUNT', // must match user's active address.
            value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
          },
        ],
      };
      const personalSignRpc = {
        method: 'personal_sign',
        params: ['hello world', '0xMYACCOUNT'],
      };
      const signTypeDatav4Rpc = {
        method: 'eth_signTypedData_v4',
        params: ['0xMyaccount', getSignParams({ hexChainId: chainId })],
      };

      let rpc;
      switch (type) {
        case 'PERSONAL_SIGN':
          rpc = personalSignRpc;
          break;
        case 'ETH_SENDTRANSACTION':
          rpc = sendTransactionRpc;
          break;
        case 'ETH_SIGNTYPEDDATA_V4':
          rpc = signTypeDatav4Rpc;
          break;
        case 'ETH_CHAINID':
          rpc = { method: 'eth_chainId', params: [] };
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      const hexResponse = await sdk?.connectWith(rpc);
      // const accounts = window.ethereum?.request({method: 'eth_requestAccounts', params: []});
      console.debug(`connectWith response:`, hexResponse);
      setResponse(hexResponse);
    } catch (err) {
      console.log('connectWith ERR', err);
      setRpcError(err);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ paddingBottom: 100 }}>
        <div style={{ padding: 20 }}>
          <MetaMaskButton />
        </div>
        <div
          style={{ display: 'flex', flexDirection: !connected ? "column" : "row-reverse" }}
        >
          <div
            style={
              !connecting
                ? connected
                  ? { minWidth: '50%' }
                  : {}
                : { marginBottom: '20px', marginTop: '20px' }
            }
          >
            <SDKStatus
              requesting={requesting}
              response={response}
              error={rpcError}
            />
          </div>
          <div style={!connected ? { width: '100%' } : {}}>
            {connected && (
              <>
                <h2 style={{ textAlign: 'center' }}>Test Actions</h2>
                <hr></hr>
                <div className="action-buttons">
                  <button style={{ padding: 10, margin: 10 }} onClick={connect}>
                    Request Accounts
                  </button>
                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={ethAccounts}
                  >
                    eth_accounts
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={walletRequest}
                  >
                    wallet_requestPermissions
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={getPermissions}
                  >
                    wallet_getPermissions
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={interactEthers}
                  >
                    ping (ethers)
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={eth_signTypedData_v4}
                  >
                    eth_signTypedData_v4
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={personalSign}
                  >
                    personal_sign
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={testPayload}
                  >
                    testPayload
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={testEthers}
                  >
                    testEthers
                  </button>

                  <button
                    className={'Button-Normal'}
                    style={{ padding: 10, margin: 10 }}
                    onClick={() => changeNetwork('0x89')}
                  >
                    Switch to Polygon
                  </button>

                  <button
                    className={'Button-Normal'}
                    style={{ padding: 10, margin: 10 }}
                    onClick={addEthereumChain}
                  >
                    Add Polygon Chain
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={sendTransaction}
                  >
                    sendTransaction
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={addGanache}
                  >
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
                  
                  <button style={{ padding: 10, margin: 10 }} onClick={ethAccounts}>
                    eth_accounts
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={walletRequest}
                  >
                    wallet_requestPermissions
                  </button>

                  <button
                    style={{ padding: 10, margin: 10 }}
                    onClick={getPermissions}
                  >
                    wallet_getPermissions
                  </button>

                  <h2 style={{ textAlign: 'center' }}>Batch Tests</h2>
                  <hr></hr>
                  <div className="action-group">
                    <button
                      style={{ padding: 10, margin: 10 }}
                      className="chain"
                      onClick={handleChainRPCs}
                    >
                      Chain RPC Calls
                    </button>

                    <button
                      style={{ padding: 10, margin: 10 }}
                      className="chain"
                      onClick={chainSwitchAndSignAndBack}
                    >
                      Chain Switch + sign + switch back
                    </button>

                    <button
                      style={{ padding: 10, margin: 10 }}
                      className="chain"
                      onClick={chainTransactions}
                    >
                      Chain sendTransaction + personal_sign + sendTransaction
                    </button>
                  </div>
                </div>
              </>
            )}
            {connecting && (
              <>
                <h2 style={{ textAlign: 'center' }}>Connect Methods</h2>
                <hr></hr>
                <div className="action-group">
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={connect}
                  >
                    Connect
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={connectAndSign}
                  >
                    Connect And Sign
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={() => connectWith({ type: 'PERSONAL_SIGN' })}
                  >
                    Connect With (personal_sign)
                  </button>
                </div>
              </>
            )}

            {!connecting && !connected && (
              <div>
                <h2 style={{ textAlign: 'center' }}>Connect Methods</h2>
                <hr></hr>
                <div className="action-group">
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={connect}
                  >
                    Connect
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={connectAndSign}
                  >
                    Connect And Sign
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={() => connectWith({ type: 'ETH_SENDTRANSACTION' })}
                  >
                    Connect With (eth_sendTransaction)
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={() => connectWith({ type: 'PERSONAL_SIGN' })}
                  >
                    Connect With (personal_sign)
                  </button>
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: 'rgb(249, 115, 22)',
                    }}
                    onClick={() => connectWith({ type: 'ETH_CHAINID' })}
                  >
                    Connect With (eth_chainId)
                  </button>
                </div>
              </div>
            )}

            {!connecting && readOnlyCalls && (
              <div>
                <h2 style={{ textAlign: 'center' }}>Read-only Call Tests</h2>
                <hr></hr>
                <div className="action-group">
                  <button
                    style={{
                      padding: 10,
                      margin: 10,
                      backgroundColor: '#FFFFCC',
                    }}
                    onClick={testReadOnlyCalls}
                  >
                    testReadOnlyCalls
                  </button>
                </div>
              </div>
            )}

            <hr></hr>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                style={{ padding: 10, margin: 10, backgroundColor: 'red' }}
                onClick={terminate}
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <RPCHistoryViewer />
    </>
  );
};

export default function WrapDemo() {
  return <Demo />;
}
