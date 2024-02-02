# Necessity of Infura API Key for Wagmi on Mobile

## Mobile Optimization and Read-Only Calls

Wagmi is not optimized for mobile environments. This limitation becomes evident when dealing with read-only calls, which are queries that fetch data from the blockchain without making a transaction. Since mobile apps may not maintain a continuous connection to MetaMask, these read-only calls can fail, leading to a suboptimal user experience.

These are the errors that might occur after a while in mobile environments when using Wagmi in your Dapp without an Infura API key:

<img width="568" alt="Screenshot 2024-02-02 at 15 25 34" src="https://github.com/MetaMask/metamask-sdk/assets/61094771/e96d3bc1-ab5a-44b4-9b42-7a246238fde5">


## The Role of Infura

An Infura API key is crucial because it provides a direct and reliable connection to the Ethereum network, independent of the user's wallet connection. This is particularly beneficial for mobile apps that rely on Wagmi, which is not inherently designed for mobile's variable connectivity and background processing constraints.

## Solution

By including an Infura API key in the MetaMask SDK props, developers ensure:

- **Uninterrupted Access:** Continuous network access for read-only calls, regardless of MetaMask's state.

- **Enhanced Stability:** Stabilized app functionality by relying on Infura's robust infrastructure rather than mobile's fluctuating network conditions.

In essence, an Infura API key compensates for Wagmi's lack of mobile optimization by providing a stable network backend for read-only operations.

Visit [Infura.io](https://www.infura.io/) to get an API key.
