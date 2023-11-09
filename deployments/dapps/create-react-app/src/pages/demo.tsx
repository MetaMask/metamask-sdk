import { useSDK } from '@metamask/sdk-react';
import { useState } from 'react';
import { send_eth_signTypedData_v4, send_personal_sign } from '../SignHelpers';
import HeaderStatus from '../components/header-status';
import RPCHistoryViewer from '../components/rpchistory-viewer';
import './demo.css';

export const Demo = () => {
  const { sdk, connected, provider } = useSDK();
  const [response, setResponse] = useState<unknown>('');
  const [rpcError, setRpcError] = useState<unknown>();
  const [requesting, setRequesting] = useState(false);

  if (!sdk) {
    return <div>SDK is not initialized</div>;
  }

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

  const readOnlyCalls = async () => {
    if (!sdk?.hasReadOnlyRPCCalls() && !provider) {
      setResponse('readOnlyCalls are not set and provider is not set. Please set your infuraAPIKey in the SDK Options');
      return;
    }
    try {
      const result = await provider?.request({
        method: 'eth_blockNumber',
        params: [],
      });
      const gotFrom = sdk.hasReadOnlyRPCCalls() ? 'infura' : 'MetaMask provider';
      setResponse(`(${gotFrom}) ${result}`);
    } catch (e) {
      console.log(`error getting the blockNumber`, e);
      setResponse(e);
    }
  };

  const addEthereumChain = () => {
    if (!provider) {
      throw new Error(`invalid ethereum provider`);
    }


    provider
      .request({
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
      })
      .then((res) => console.log('add', res))
      .catch((e) => console.log('ADD ERR', e));
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: provider?.selectedAddress, // must match user's active address.
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
    if (!provider) {
      setResponse(`invalid ethereum provider`);
      return;
    }

    try {

      setRequesting(true);
      setRpcError(null);
      setResponse(''); // reset response first
      const result = await send_eth_signTypedData_v4(provider as any, provider.chainId ?? '0x1');
      setResponse(result);
    } catch (e) {
      console.log(e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  const eth_personal_sign = async () => {
    if (!provider) {
      setResponse(`invalid ethereum provider`);
      return;
    }

    try {
      const result = await send_personal_sign(provider as any);
      setResponse(result);
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

  const changeNetwork = async (hexChainId: string) => {
    console.debug(`switching to network chainId=${hexChainId}`);
    setRpcError(null);
    setRequesting(true);

    try {
      const response = await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
      });
      console.debug(`response`, response);
    } catch (e) {
      console.log(e);
      setRpcError(e);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="App">
      <h1>SDK Provider Demo</h1>

      <HeaderStatus
        requesting={requesting}
        response={response}
        error={rpcError}
      />

      {connected ? (
        <div>
          <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={connect}>
            Request Accounts
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={eth_signTypedData_v4}
          >
            eth_signTypedData_v4
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={eth_personal_sign}
          >
            personal_sign
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={sendTransaction}
          >
            Send transaction
          </button>

          {provider?.chainId === '0x1' ? (
            <button
              className={'Button-Normal'}
              style={{ padding: 10, margin: 10 }}
              onClick={() => changeNetwork('0x5')}
            >
              Switch to Goerli
            </button>
          ) : (
            <button
              className={'Button-Normal'}
              style={{ padding: 10, margin: 10 }}
              onClick={() => changeNetwork('0x1')}
            >
              Switch to Mainnet
            </button>
          )}

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
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={readOnlyCalls}
          >
            readOnlyCalls
          </button>
        </div>
      ) : (
        <div>
          <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={connect}>
            Connect
          </button>
          <button className={'Button-Normal'} style={{ padding: 10, margin: 10 }} onClick={connectAndSign}>
            Connect w/ Sign
          </button>
        </div>
      )}

      <button
        className={'Button-Danger'}
        style={{ padding: 10, margin: 10 }}
        onClick={terminate}
      >
        Terminate
      </button>
      <RPCHistoryViewer />
    </div>
  );
};
