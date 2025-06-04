# MetaMask Multichain SDK

This SDK provides a way for dapps to connect to the MetaMask wallet via the `externally_connectable` API. It includes a React hook `useSDK` for easy integration in React applications and an `SDK` class for direct usage.

The MetaMask Multichain SDK simplifies interaction with MetaMask's Multichain API. It allows dApps to:

- Establish connections with the MetaMask wallet via the `externally_connectable` API.
- Manage sessions across multiple chains using [CAIP-2](https://chainagnostic.org/CAIPs/caip-2) identifiers.
- Invoke methods and handle notifications from the wallet.

## Usage

### Using the `useSDK` Hook (React)

The `useSDK` hook manages the connection state, sessions, and method invocations, making it easy to integrate into React applications.

```typescript
import React, { useEffect } from 'react';
import { useSDK } from '@metamask/sdk';

function App() {
  const {
    isConnected,
    currentSession,
    extensionId,
    connect,
    disconnect,
    createSession,
    getSession,
    revokeSession,
    invokeMethod,
    onNotification,
  } = useSDK({
    onSessionChanged: (notification) => {
      console.log('Session changed:', notification);
    },
    onWalletNotify: (notification) => {
      console.log('Wallet notification:', notification);
    },
  });

  // Connect to MetaMask
  const handleConnect = async () => {
    try {
      await connect('your-extension-id'); // Replace with your MetaMask extension ID
      console.log('Connected to MetaMask');
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  // Create a session with specified chain IDs (e.g., Ethereum Mainnet and Polygon)
  const handleCreateSession = async () => {
    try {
      const scopes = ['eip155:1', 'eip155:137'];
      const session = await createSession(scopes);
      console.log('Session created:', session);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Invoke a method on a specific chain
  const handleInvokeMethod = async () => {
    try {
      const result = await invokeMethod('eip155:1', {
        method: 'eth_blockNumber',
        params: [],
      });
      console.log('Block number:', result);
    } catch (error) {
      console.error('Error invoking method:', error);
    }
  };

  // Handle incoming notifications
  useEffect(() => {
    onNotification((notification) => {
      console.log('Received notification:', notification);
    });
  }, [onNotification]);

  return (
    <div>
      <button onClick={handleConnect}>Connect to MetaMask</button>
      <button onClick={handleCreateSession} disabled={!isConnected}>
        Create Session
      </button>
      <button onClick={handleInvokeMethod} disabled={!currentSession}>
        Invoke Method
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
    </div>
  );
}

export default App;
```

### Using the `SDK` Class Directly

For non-React applications or if you prefer direct usage, you can interact with the `SDK` class.

```typescript
import { SDK } from '@metamask/sdk';

async function main() {
  const sdk = new SDK();

  // Connect to MetaMask
  try {
    const connected = await sdk.setExtensionIdAndConnect('your-extension-id'); // Replace with your MetaMask extension ID
    if (connected) {
      console.log('Connected to MetaMask');
    } else {
      console.error('Failed to connect to MetaMask');
      return;
    }
  } catch (error) {
    console.error('Connection error:', error);
    return;
  }

  // Create a session
  try {
    const scopes = ['eip155:1', 'eip155:137']; // Replace with desired chain IDs
    const session = await sdk.createSession(scopes);
    console.log('Session created:', session);
  } catch (error) {
    console.error('Error creating session:', error);
    return;
  }

  // Invoke a method
  try {
    const result = await sdk.invokeMethod({
      scope: 'eip155:1',
      request: {
        method: 'eth_blockNumber',
        params: [],
      },
    });
    console.log('Block number:', result);
  } catch (error) {
    console.error('Error invoking method:', error);
  }

  // Handle notifications
  sdk.onNotification((notification) => {
    console.log('Received notification:', notification);
  });

  // Disconnect when done
  sdk.disconnect();
}

main();
```

## API Reference

**Methods:**

- `setExtensionIdAndConnect(extensionId: string): Promise<boolean>` - Sets the extension ID and attempts to connect.
- `disconnect(): void` - Disconnects from MetaMask.
- `createSession(scopes: CaipChainId[]): Promise<Json>` - Creates a session with the specified chain scopes.
- `getSession(): Promise<Json>` - Retrieves the current session.
- `revokeSession(): Promise<Json>` - Revokes the current session.
- `invokeMethod({ scope, request }: { scope: CaipChainId; request: { method: string; params: Json[] } }): Promise<Json>` - Invokes a method on the specified chain.
- `onNotification(callback: (notification: any) => void): void` - Registers a callback for notifications.
