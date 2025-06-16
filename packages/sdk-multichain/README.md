# MetaMask SDK Multichain

The MetaMask SDK Multichain is a protocol-based, domain-driven SDK that enables seamless integration with MetaMask wallets across multiple blockchain networks and platforms.

## Overview

The SDK provides a unified interface for dapps to connect with MetaMask Extension or Mobile wallets, regardless of the platform (browser, mobile, or Node.js) or blockchain protocol. It automatically handles connection flows, deeplinks, and QR codes based on the user's environment.

## Architecture

### Domain-Driven Design

The SDK follows a clean domain-driven architecture with clear separation of concerns:

```
src/
├── domain/           # Core business logic and abstractions
│   ├── multichain/   # Multichain protocol abstractions
│   ├── events/       # Event-driven communication
│   ├── platform/     # Platform detection utilities
│   └── store/        # Storage abstractions
├── multichain/       # Concrete implementations
└── store/           # Storage implementations
```

### Core Domains

#### 1. **Multichain Domain**
The heart of the SDK, providing protocol-agnostic blockchain interactions:

- **MultichainSDKBase**: Abstract base class defining the core SDK interface
  - `connect()`: Establish wallet connection
  - `disconnect()`: Terminate connection
  - `createSession()`: Create a new session with specified scopes and accounts
  - `invokeMethod()`: Execute protocol-specific methods
  - `onNotification()`: Subscribe to wallet notifications

- **Protocol Support**: Currently implements EIP155 (Ethereum) with extensible design for additional protocols
- **Scope-based Permissions**: Uses CAIP (Chain Agnostic Improvement Proposal) format for cross-chain compatibility

#### 2. **Events Domain**
Type-safe event system for SDK and wallet communication:

- **SDKEvents**: Internal SDK lifecycle events
  - `initialized`: SDK initialization complete
  - `display_uri`: QR code URI for mobile connections
  - `provider_update`: Provider state changes
  - `connection_status`: Connection state updates

- **ExtensionEvents**: Wallet-specific events
  - `chainChanged`: Active chain switched
  - `accountsChanged`: Account selection changed
  - `connect/disconnect`: Connection lifecycle

#### 3. **Platform Domain**
Runtime environment detection:

- `isNotBrowser()`: Detects non-browser environments
- `isReactNative()`: Identifies React Native runtime
- Platform-specific initialization and transport selection

#### 4. **Store Domain**
Abstract storage layer for cross-platform state persistence:

- **StoreClient**: High-level storage interface for SDK state
- **StoreAdapter**: Platform-agnostic storage abstraction
- Implementations for web (localStorage), React Native (AsyncStorage), and Node.js

### Protocol Implementation

#### EIP155 (Ethereum)
Fully typed RPC methods for Ethereum interactions:

```typescript
type EIP155 = {
  methods: {
    // Signing methods
    personal_sign: RpcMethod<{ message: string; account: string }, string>;
    signMessage: RpcMethod<{ message: string }, string>;
    signTransaction: RpcMethod<TransactionParams, string>;

    // Transaction methods
    eth_sendTransaction: RpcMethod<TransactionParams, string>;
    signAndSendTransaction: RpcMethod<TransactionParams, string>;

    // Account & chain management
    eth_accounts: RpcMethod<void, string[]>;
    eth_chainId: RpcMethod<void, string>;
    wallet_switchEthereumChain: RpcMethod<{ chainId: string }, void>;
    wallet_addEthereumChain: RpcMethod<ChainParams, void>;

    // Read methods
    eth_call: RpcMethod<CallParams, string>;
    eth_getBalance: RpcMethod<BalanceParams, string>;
  };
  events: ['eth_subscription'];
};
```

### Key Design Patterns

1. **Abstract Base Classes**: Define contracts for implementations while keeping the domain pure
2. **Protocol Abstraction**: RPCAPI interface allows adding new blockchain protocols without changing core logic
3. **Type-Safe Events**: Strongly typed event emitters prevent runtime errors
4. **CAIP Standards**: Chain-agnostic account and chain identifiers for multichain support
5. **Platform Adapters**: Abstract platform differences behind common interfaces

## Usage

### Installation

```bash
npm install @metamask/sdk-multichain
```

### Basic Example

```typescript
import { createMetamaskSDK } from '@metamask/sdk-multichain';

// Initialize SDK
const sdk = await createMetamaskSDK({
  dapp: {
    name: 'My Dapp',
    url: 'https://mydapp.com',
    logoUrl: 'https://mydapp.com/logo.png'
  },
  analytics: { enabled: true, integrationType: 'my-dapp' },
  logging: { logLevel: 'info' },
  storage: { enabled: true },
  ui: { headless: false }
});

// Connect to wallet
await sdk.connect();

// Create a session with Ethereum mainnet scope
const session = await sdk.createSession(
  ['eip155:1'], // Ethereum mainnet
  ['eip155:1:0x...'] // Account
);

// Invoke a method
const signature = await sdk.invokeMethod({
  scope: 'eip155:1',
  request: {
    method: 'personal_sign',
    params: {
      message: 'Hello MetaMask!',
      account: '0x...'
    }
  }
});
```

### Platform-Specific Initialization

The SDK provides platform-specific entry points that handle storage and transport setup:

- **Browser**: Uses localStorage and extension/QR code transport
- **React Native**: Uses AsyncStorage and deeplink transport
- **Node.js**: Uses file-based storage and WebSocket transport

## API Reference

### MultichainSDK

The main SDK class implementing `MultichainSDKBase`:

| Method | Description |
|--------|-------------|
| `connect(options?)` | Establish connection with MetaMask |
| `disconnect()` | Close the current connection |
| `getSession()` | Retrieve current session data |
| `createSession(scopes, accounts)` | Create new session with permissions |
| `revokeSession()` | Revoke current session |
| `invokeMethod(options)` | Execute RPC method on specified scope |
| `onNotification(callback)` | Subscribe to wallet notifications |

### Types

Key types exported by the SDK:

```typescript
// Session data structure
type SessionData = {
  scopes: Record<string, ScopeData>;
  accounts: CaipAccountId[];
};

// Scope format (CAIP-2)
type Scope = `${namespace}:${reference}`;

// Method invocation options
type InvokeMethodOptions = {
  scope: Scope;
  request: {
    method: string;
    params: Json;
  };
};
```

## Contributing

We welcome contributions! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License.
