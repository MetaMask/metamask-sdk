# @metamask/sdk-multichain

A CAIP-compliant multichain provider implementation for MetaMask, enabling chain-agnostic wallet interactions following the [Chain Agnostic Improvement Proposals](https://chainagnostic.org/) specifications.

## Features

- CAIP-25 compliant session management
- CAIP-27 compliant method invocation
- Multiple provider connection strategies:
  - Chrome Extension via `externally_connectable`
  - Existing EIP-1193/EIP-6963 providers
  - Duplex stream (e.g., for mobile wallet connections)
- Session persistence and restoration
- Notification handling
- TypeScript support

## Installation

```bash
yarn add @metamask/sdk-multichain
```

## Usage

```typescript
import { createMetamaskMultichain } from '@metamask/sdk-multichain';
const multichain = createMetamaskMultichain();
// Connect to MetaMask extension
await multichain.connect({ extensionId: 'your-extension-id' });

// Create a session
const session = await multichain.createSession({
  requiredScopes: {
    'eip155:1': {
      methods: ['eth_sendTransaction', 'personal_sign'],
      notifications: ['accountsChanged', 'chainChanged']
    }
  }
});

// Invoke a method
const result = await multichain.invokeMethod({
  scope: 'eip155:1',
  request: {
    method: 'eth_sendTransaction',
    params: [/ transaction parameters /]
  }
});
```

## Advanced Usage

### Connection Strategies

The provider supports multiple connection strategies that can be configured and switched dynamically:

```typescript
import { ProviderType } from '@metamask/sdk-multichain';

// Initialize with multiple connection options
const multichain = createMetamaskMultichain({
  preferredProvider: ProviderType.CHROME_EXTENSION,
  providerConfig: {
    eip1193Provider: window.ethereum,
    existingStream: mobileWebsocketStream,
  }
});

// Connect using Chrome Extension
await multichain.connect({
  extensionId: 'your-extension-id'
});

// Or connect using an EIP-1193 provider
await multichain.connect({
  provider: window.ethereum
});

// Or connect using duplex stream (e.g., mobile wallet)
await multichain.connect({
  stream: mobileWebsocketStream
});
```

Available provider types:
- `ProviderType.CHROME_EXTENSION`: Uses Chrome's `externally_connectable` API for direct extension communication
- `ProviderType.EIP1193_PROVIDER`: Uses any provider implementing the standard Ethereum Provider API (EIP-1193)
- `ProviderType.STREAM_PROVIDER`: Uses a Duplex stream for bidirectional communication (e.g., for mobile connections)

Dynamic provider switching:
```typescript
// Switch preferred provider at runtime
await multichain.setPreferredProvider(ProviderType.STREAM_PROVIDER);

// Check current connection status
const isConnected = multichain.isConnected();

// Disconnect current provider
await multichain.disconnect();
```

### Event Handling

The provider supports two types of events:

```typescript
// Session state changes
multichain.addListener('sessionChanged', (event) => {
  console.log('Session event:', event.type); // 'created', 'updated', or 'revoked'
  console.log('Session data:', event.session);
});

// Chain-specific notifications
multichain.addListener('notification', (notification) => {
  if (notification?.method === 'wallet_sessionChanged') {
    console.log('Session scope updated:', notification.params);
  } else {
    console.log('Received notification:', notification);
  }
});

// Remove listeners when needed
multichain.removeListener('sessionChanged', listener);
multichain.removeListener('notification', listener);
```

Error handling should be done using try-catch blocks:

```typescript
try {
  await multichain.invokeMethod({
    scope: 'eip155:1',
    request: {
      method: 'eth_sendTransaction',
      params: [/* ... */]
    }
  });
} catch (error) {
  console.error('Transaction failed:', error);
}
```

Common error codes:
- `4001`: User rejected request
- `4100`: Unauthorized
- `4200`: Unsupported method
- `4900`: Disconnected
- `4901`: Chain disconnected

## CAIP Compliance

This package implements the following CAIP specifications:

- [CAIP-25](https://chainagnostic.org/CAIPs/caip-25): Wallet Create Session JSON-RPC Method
- [CAIP-27](https://chainagnostic.org/CAIPs/caip-27): Wallet Invoke Method JSON-RPC Method
- [CAIP-217](https://chainagnostic.org/CAIPs/caip-217): Authorization Scopes
- [CAIP-171](https://chainagnostic.org/CAIPs/caip-171): Session Identifiers

## Architecture

The package is designed to be transport-agnostic, allowing different connection strategies while maintaining a consistent CAIP-compliant interface. The core components are:

- `MetamaskMultichain`: Main class implementing CAIP specifications
- `ExtensionProvider`: Handles different connection strategies
- Session management utilities
- Type definitions following CAIP standards

## Development Status

This package is currently in active development. While the core CAIP implementation is stable, some utility functions and initialization helpers may be removed or modified in future versions to maintain a cleaner separation of concerns.

