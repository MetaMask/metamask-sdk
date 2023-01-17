import React from 'react';
import logo from './logo.svg';
import './App.css';
import { MetaMaskSDK } from '@metamask/sdk';

function App() {
  return (
    <div className="App">
      <button onClick={() => { console.debug(`TODO`) }}>Debug</button>
    </div>
  );
}

export default App;
