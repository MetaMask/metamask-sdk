import React from 'react';
import './App.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MetaMaskSDK } from '@metamask/sdk';

function App() {
  return (
    <div className="App">
      <button onClick={() => { console.debug(`TODO`) }}>Debug</button>
    </div>
  );
}

export default App;
