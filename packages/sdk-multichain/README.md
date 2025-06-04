# MetaMask SDK Multichain

Multichain package for MetaMask SDK.

## Installation

```bash
npm install @metamask/sdk-multichain
```

## Usage

### Standard Import (Single File)

For backward compatibility and simplest usage:

```javascript
// Browser
import { createMetamaskSDK } from '@metamask/sdk-multichain';

// Node.js
const { createMetamaskSDK } = require('@metamask/sdk-multichain');

// React Native
import { createMetamaskSDK } from '@metamask/sdk-multichain';
```

### Optimized Import (Shared Chunks)

For better performance and reduced code duplication, use the chunked builds:

```javascript
// Browser (with shared chunks)
import { createMetamaskSDK } from '@metamask/sdk-multichain/chunked';

// Node.js (with shared chunks)
const { createMetamaskSDK } = require('@metamask/sdk-multichain/chunked');

// React Native (with shared chunks)
import { createMetamaskSDK } from '@metamask/sdk-multichain/chunked';
```

## Build Optimization

This package includes optimized builds that significantly reduce code duplication:

### Single File Builds (Backward Compatible)
- **Browser**: `dist/browser/es/metamask-sdk.js` (~5.3KB)
- **Node.js**: `dist/node/cjs-compat/metamask-sdk.js` (~5.3KB)
- **React Native**: `dist/react-native/compat/metamask-sdk.js` (~5.3KB)

### Chunked Builds (Optimized)
- **Shared Core**: `core-shared-CBOGy5L3.js` (~4.4KB) - Identical across all platforms
- **Platform Adapters**: ~380-420B each (browser, node, react-native)
- **Entry Points**: ~700-850B each

### Benefits of Chunked Builds

1. **Reduced Duplication**: Core functionality is shared across all platforms
2. **Better Caching**: Shared chunks can be cached once and reused
3. **Smaller Total Size**: When using multiple platforms, total bundle size is significantly reduced
4. **Platform-Specific Optimization**: Only platform-specific code is bundled separately

### Size Comparison

**Before Optimization:**
- Browser: 5.3KB
- Node.js: 5.3KB
- React Native: 5.3KB
- **Total**: 15.9KB (with significant duplication)

**After Optimization:**
- Shared Core: 4.4KB (identical across platforms)
- Browser Adapter: 383B
- Node.js Adapter: 386B
- React Native Adapter: 380B
- Entry Points: ~750B each
- **Total Unique Code**: ~6.3KB (60% reduction in duplication)

## API

```javascript
const sdk = await createMetamaskSDK({
  storage: {
    // Storage configuration
  },
  // Other SDK options
});
```
