# MetaMask Connect Multichain

The MetaMask Connect Multichain module is a protocol-based, domain-driven Connect that enables seamless integration with MetaMask wallets across multiple blockchain networks and platforms.

## Overview

MetaMask Connect Multichain module provides a unified interface for dapps to connect with MetaMask Extension or Mobile wallets, regardless of the platform (browser, mobile, or Node.js) or blockchain protocol. It automatically handles connection flows, deeplinks, and QR codes based on the user's environment.

## Architecture

### Domain-Driven Design

MetaMask Connect Multichain module follows a clean domain-driven architecture with clear separation of concerns:

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
