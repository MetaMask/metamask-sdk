# MetaMask Multichain React Native Test Dapp

A test dapp for the MetaMask Multichain API built with React Native and Expo.

## Overview

This React Native application is a complete port of the multichain-react web test dapp, providing the same functionality on mobile devices. It demonstrates the capabilities of the MetaMask Multichain SDK including:

- Multi-chain network support (Ethereum, Linea, Arbitrum, Polygon, Solana, etc.)
- Account management across different chains
- Method invocation with customizable parameters
- Real-time session management
- Support for both EVM and non-EVM chains (Solana)

## Prerequisites

- Node.js (^18.18 || >=20)
- Yarn (v4.1.1+)
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Building from local

From the project root:

```bash
# Build dependencies
yarn ibuild
```

## Installation

From the project root:

```bash
# Install dependencies
yarn install

# Navigate to the React Native playground
cd playground/multichain-react-native

# Start the development server
yarn start
```

## Running the App

### iOS

```bash
yarn ios
```

### Android

```bash
yarn android
```

### Web (for testing)

```bash
yarn web
```

## Project Structure

```
multichain-react-native/
├── App.tsx                    # Main application component
├── index.ts                   # Entry point with SDK provider
├── src/
│   ├── components/
│   │   ├── DynamicInputs.tsx      # Checkbox selection UI
│   │   ├── FeaturedNetworks.tsx   # Network selection component
│   │   └── ScopeCard.tsx          # Network scope card with method invocation
│   ├── constants/
│   │   ├── index.ts               # App constants
│   │   ├── methods.ts             # RPC method configurations
│   │   └── networks.ts            # Network definitions
│   ├── helpers/
│   │   ├── AddressHelpers.ts           # CAIP address formatting
│   │   ├── JsonHelpers.ts              # JSON parsing utilities
│   │   ├── MethodInvocationHelpers.ts  # Method invocation utilities
│   │   └── solana-method-signatures.ts # Solana transaction generation
│   ├── sdk/
│   │   ├── SDKProvider.tsx        # SDK context provider
│   │   └── index.ts               # SDK exports
│   └── styles/
│       └── shared.ts              # Shared StyleSheet styles
├── assets/                    # App icons and splash screens
├── package.json
└── tsconfig.json
```

## Key Features

### 1. **Network Selection**
- Support for 10+ networks including Ethereum mainnet, L2s, and Solana
- Checkbox-based selection UI with visual feedback
- Multi-network connections in a single session

### 2. **Account Management**
- Dropdown selector for accounts per network
- Display of active account addresses
- Support for CAIP-10 formatted addresses

### 3. **Method Invocation**
- Dropdown selector for available RPC methods per network
- Editable JSON request editor with collapsible UI
- Parameter injection for methods requiring addresses/chainIds
- Real-time result display with success/error indicators
- Support for EVM methods (eth_*, personal_sign, etc.)
- Support for Solana methods (signMessage, signTransaction, etc.)

### 4. **React Native Optimizations**
- Native UI components (Picker, TextInput, TouchableOpacity)
- Proper SafeAreaView implementation for device notches
- ScrollView for content overflow handling
- StyleSheet-based styling for performance
- Buffer polyfill for Solana web3.js compatibility

## Architecture Differences from Web Version

### UI Components
- **Web**: HTML elements (`<div>`, `<button>`, `<select>`) with Tailwind CSS
- **React Native**: Native components (`View`, `TouchableOpacity`, `Picker`) with StyleSheet

### Styling Approach
- **Web**: Tailwind utility classes
- **React Native**: StyleSheet API with shared color palette and styles

### Collapsibles
- **Web**: HTML `<details>` element
- **React Native**: Custom implementation with state management

### Text Encoding
- **Web**: Native `TextEncoder` API
- **React Native**: Buffer polyfill for base64 encoding

### Polyfills
- **Web**: Webpack node polyfills
- **React Native**: Buffer global polyfill configured at app initialization

## Environment Variables

Create a `.env` file in the project root:

```env
# Optional: Helius RPC API key for enhanced Solana RPC performance
# If not provided, falls back to public Solana RPC endpoints
REACT_APP_HELIUS_API_KEY=your_helius_api_key_here
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Run `yarn install` from the workspace root
   - Ensure all workspace dependencies are linked

2. **Buffer is not defined**
   - The Buffer polyfill is configured in `App.tsx`
   - Ensure imports are in the correct order

3. **Picker not working**
   - Install `@react-native-picker/picker` if not already installed
   - For iOS, run `npx pod-install` after installation

4. **Solana transactions failing**
   - Check RPC endpoint connectivity
   - Verify Helius API key if using one
   - App falls back to public endpoints if Helius fails

## Development

### Adding New Networks

Edit `src/constants/networks.ts`:

```typescript
export const FEATURED_NETWORKS = {
  'Your Network': 'caip:chainId',
  // ...existing networks
};
```

### Adding Custom Methods

Methods are automatically populated from `@metamask/api-specs`. For methods requiring parameter injection, update `src/constants/methods.ts`:

```typescript
export const METHODS_REQUIRING_PARAM_INJECTION = {
  your_method: true,
  // ...existing methods
};
```

## Testing

```bash
# Currently no tests configured
yarn test
```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## License

See the main project LICENSE file.

## Contributing

This is part of the MetaMask SDK monorepo. Please refer to the main repository for contribution guidelines.

## Support

For issues and questions, please file an issue in the main MetaMask SDK repository.

