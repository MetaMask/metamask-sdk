# MetaMask Test Dapp Multichain

A test dapp for the MetaMask Multichain API.

## Installation

`yarn`

## Configuration

### Environment Variables

This project supports optional environment variables for enhanced functionality:

#### Helius RPC API Key (Optional)
For improved Solana RPC performance, you can configure a Helius API key:

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get a free API key from [Helius](https://www.helius.dev/)

3. Add your API key to `.env.local`:
   ```
   REACT_APP_HELIUS_API_KEY=your_actual_api_key_here
   ```

**Note:** If no Helius API key is provided, the app will automatically fall back to public Solana RPC endpoints.

## Usage

To start the development server:

`yarn start`

This will launch the test dapp, allowing you to interact with the MetaMask Multichain API.

## Contributing

#### This project uses the [MetaMask Module Template](https://github.com/MetaMask/metamask-module-template)
