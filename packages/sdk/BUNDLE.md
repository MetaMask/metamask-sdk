# Bundle Configuration for @metamask/providers

The @metamask/providers package relies on Node.js-specific modules, particularly:
- `readable-stream`
- `extension-port-stream`
- `@metamask/json-rpc-middleware-stream`

These Node.js stream implementations don't work directly in browsers and require proper polyfills/transformations.

## Two Possible Approaches

### 1. Bundle the Dependencies (Current Approach)

#### Pros:
- Works out of the box for developers
- No need for complex polyfill setup in consuming apps
- Guaranteed compatibility

#### Cons:
- Larger bundle size
- Same code might be included multiple times if other dependencies use streams

### 2. Keep as External Dependencies

```js
const baseExternalDeps = [
  // ... other deps ...
  '@metamask/providers',
];
```

#### Pros:
- Smaller bundle size
- Better deduplication of common dependencies
- More control for developers

#### Cons:
- Requires proper setup in consuming applications:
  - Stream polyfills
  - Buffer polyfills
  - Proper bundler configuration

###  Current Decision

We chose to bundle the dependencies to prioritize developer experience over bundle size, making it easier for developers to integrate the SDK without dealing with complex polyfill setups.
