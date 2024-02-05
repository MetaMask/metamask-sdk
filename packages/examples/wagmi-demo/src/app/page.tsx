'use client';
// Import necessary hooks and utilities from wagmi and ethers (for signing messages)
import { useAccount, useConnect, useDisconnect, useSwitchChain, useSignMessage, useSendTransaction } from 'wagmi';
import { ethers } from 'ethers';

function App() {
   const account = useAccount();
   const { connectors, connect, error: connectError } = useConnect();
   const { disconnect } = useDisconnect();
   const { chains, switchChain, error: switchChainError } = useSwitchChain();
   const { signMessage, error: signError } = useSignMessage();
   const { sendTransaction, error: txError } = useSendTransaction();

   // Example send transaction function
   const sendTx = async () => {
      if (!account?.isConnected) return;

      await sendTransaction({
         to: '0x0000000000000000000000000000000000000000',
         value: ethers.parseEther('0.01') // Send 0.01 ETH
      });
   };

   // Example sign message function
   const signAMessage = async () => {
      if (!account?.isConnected) return;

      await signMessage({
         message: 'Hello, world!'
      });
   };

   return (
      <div style={styles.container}>
         <div style={styles.info}>
            <h2 style={styles.title}>Account</h2>
            <div>
               <br />
               Address: {account?.address}
               <br />
               ChainId: {account.chainId}
               <br />
               Current Chain: {account.chain?.name}
               <br />
               <span
                  style={{
                     color: account?.isConnected ? 'green' : 'red',
                     fontWeight: 'bold'
                  }}
               >
                  Status: {account?.isConnected ? 'Connected' : 'Disconnected'}
               </span>
            </div>
            {!account?.isConnected ? (
               <>
                  <button
                     style={{ ...styles.button, backgroundColor: 'orange' }}
                     key={connectors[0].id}
                     onClick={() => connect({ connector: connectors[0] })}
                  >
                     Connect To {connectors[0].name}
                  </button>

                  <div>{connectError?.message}</div>
               </>
            ) : (
               <>
                  <button style={{ ...styles.button, backgroundColor: 'red' }} onClick={() => disconnect()}>
                     Disconnect
                  </button>
               </>
            )}
         </div>
         {account?.isConnected && (
            <>
               <div style={styles.info}>
                  <h2 style={styles.title}>Switch Chain</h2>
                  <div>{switchChainError?.message}</div>
                  {chains.map((chain) => (
                     <button
                        style={{ ...styles.button, backgroundColor: account.chainId === chain.id ? 'gray' : 'blue' }}
                        key={chain.id}
                        disabled={account.chainId === chain.id}
                        onClick={() => switchChain({ chainId: chain.id })}
                     >
                        Switch To {chain.name}
                     </button>
                  ))}
               </div>

               <div style={styles.info}>
                  <h2 style={styles.title}>Send Transaction</h2>
                  <div>{txError?.message}</div>
                  <button
                     style={{
                        ...styles.button,
                        backgroundColor: 'green'
                     }}
                     onClick={sendTx}
                  >
                     Send Transaction
                  </button>
               </div>

               <div style={styles.info}>
                  <h2 style={styles.title}>Sign Message</h2>
                  <div>{signError?.message}</div>
                  <button style={{ ...styles.button, backgroundColor: 'purple' }} onClick={signAMessage}>
                     Sign Message
                  </button>
               </div>
            </>
         )}
      </div>
   );
}

// Inline CSS styles
const styles = {
   container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
   },
   button: {
      margin: '5px',
      padding: '15px',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      width: '50%',
      fontSize: '16px',
      fontWeight: 'bold'
   },
   info: {
      marginBottom: '20px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '15px',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center' as 'center',
      width: '100%'
   },
   title: {
      marginTop: '0'
   }
};

export default App;
