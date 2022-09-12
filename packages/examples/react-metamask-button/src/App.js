import logo from './logo.svg';
import './App.css';
import {
  MetaMaskButton,
  useSignTypedData,
  useAccount,
  useSignMessage,
} from '@metamask/sdk-react';

// All properties on a domain are optional
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
};

// The named list of all type definitions
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
};

const value = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
};

function App() {
  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain,
      types,
      value,
    });

  const {
    data: signData,
    isError: isSignError,
    isLoading: isSignLoading,
    isSuccess: isSignSuccess,
    signMessage,
  } = useSignMessage({
    message: 'gm wagmi frens',
  });

  const { isConnected } = useAccount();

  return (
    <div className="App">
      <header className="App-header">
        <MetaMaskButton theme={'light'} color="white"></MetaMaskButton>
        {isConnected && (
          <div style={{ marginTop: 20 }}>
            <button disabled={isLoading} onClick={() => signTypedData()}>
              Click to sign
            </button>
            {isSuccess && <div>Signature: {data}</div>}
            {isError && <div>Error signing message</div>}
            <p></p>
            <button disabled={isSignLoading} onClick={() => signMessage()}>
              Sign message
            </button>
            {isSignSuccess && <div>Signature: {signData}</div>}
            {isSignError && <div>Error signing message</div>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
