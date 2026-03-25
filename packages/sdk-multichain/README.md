# MetaMask SDK Multichain (Deprecated)

> **⚠️ DEPRECATED**
>
> `@metamask/sdk-multichain` is deprecated and no longer actively maintained. Its functionality has been superseded by **MetaMask Connect**, which provides a cleaner multichain API, direct wallet communication (no relay server), and improved protocol support.
>
> **Migrate to:**
>
> - [`@metamask/connect-multichain`](https://www.npmjs.com/package/@metamask/connect-multichain) — the direct successor for multichain dapp integration
> - [`@metamask/connect-evm`](https://www.npmjs.com/package/@metamask/connect-evm) — if you only need EVM chain support
>
> **Migration guide & docs:** <https://docs.metamask.io/metamask-connect>

---

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


## Building Locally
Either build with ```yarn build``` from the root workspace project or build directly the package, in this last case, it is required that u build [ui package first](../sdk-multichain-ui/README.md)

```bash
yarn build
```

## Running Tests

```bash
yarn test
```

with coverage

```bash
yarn test:ci
```
