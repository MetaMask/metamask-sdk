# Crypto Polyfill Issue & Externalization Fix

## Problem Summary

The MetaMask SDK packages were failing in React Native environments with the error:
```
Error: crypto.getRandomValues must be defined
```

This occurred when packages tried to use `uuid` or `eciesjs` for cryptographic operations, but these libraries couldn't access the React Native crypto polyfills.

## Root Cause

Despite `uuid` and `eciesjs` being listed in `dependencies` or `peerDependencies`, they were being **bundled** into the output files instead of being kept as **external** dependencies. This happened because:

1. The Rollup `external` configuration was using simple arrays: `external: rnExternalDeps`
2. Array-based external checks don't handle sub-path imports like `uuid/v4`
3. When bundled, these modules execute in their own isolated scope before crypto polyfills are available

## The Fix

Changed the Rollup `external` configuration from arrays to functions in all affected packages:

```javascript
// Before (not working)
external: rnExternalDeps,

// After (working)
external: (id) => {
  // Always externalize uuid and eciesjs
  if (id === 'uuid' || id.startsWith('uuid/') || 
      id === 'eciesjs' || id.startsWith('eciesjs/')) {
    return true;
  }
  return rnExternalDeps.includes(id);
},
```

## Why This Works

1. **Function-based checking**: Can handle any import pattern including sub-paths
2. **Runtime resolution**: Dependencies are resolved when the app runs, after crypto polyfills are loaded
3. **Proper module order**: Ensures polyfills load before crypto-dependent libraries

## Affected Packages

- `@metamask/sdk-communication-layer`
- `@metamask/sdk`
- `@metamask/sdk-react`

## Build Output

After the fix, the build output shows proper external imports:
```javascript
import{validate as r,v4 as l}from"uuid";
import{PrivateKey as i,encrypt as o,decrypt as a}from"eciesjs";
```

Instead of bundled code, allowing React Native apps to load crypto polyfills first.

## Alternative Approaches Considered

1. **Math.random UUID**: Not cryptographically secure, doesn't fix ECIES
2. **Bundle polyfills**: Would increase bundle size and conflict with app polyfills
3. **Dynamic imports**: Would require async initialization and API changes

The externalization approach is the cleanest solution as it respects standard module resolution. 