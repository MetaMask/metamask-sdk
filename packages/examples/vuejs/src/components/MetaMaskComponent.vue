<template>
  <div class="metamask-container">
    <h1>VueJS Example</h1>

    <select v-model="selectedLanguage" @change="changeLanguage">
      <option value="">Change Language</option>
      <option
        v-for="(language, index) in availableLanguages"
        :key="index"
        :value="language"
      >
        {{ language }}
      </option>
    </select>

    <div class="info-status">
      <p>Connected chain: {{ chainId }}</p>
      <p>Connected account:{{ account }}</p>
      <p>Last response: {{ lastResponse }}</p>
      <p>Connected: {{ connected }}</p>
    </div>

    <button class="action-button" @click="onConnect">Connect</button>
    <button class="action-button" @click="onConnectAndSign">
      Connect w/ sign
    </button>
    <button class="action-button" @click="eth_signTypedData_v4">
      eth_signTypedData_v4
    </button>
    <button class="action-button" @click="personal_sign">personal_sign</button>
    <button class="action-button" @click="sendTransaction">
      Send transaction
    </button>
    <button
      v-if="this.chainId === '0x1'"
      class="action-button"
      @click="switchChain('0x5')"
    >
      Switch to Goerli
    </button>
    <button v-else class="action-button" @click="switchChain('0x1')">
      Switch to Mainnet
    </button>
    <button class="action-button" @click="addEthereumChain">Add Polygon</button>
    <button class="action-button" @click="switchChain('0x89')">
      Switch to Polygon
    </button>
    <button class="action-button" @click="readOnlyCalls">readOnlyCalls</button>
    <button class="action-button" @click="batchCalls">batch</button>
    <p></p>
    <button class="action-button-danger" @click="terminate">TERMINATE</button>
  </div>
</template>

<script>
import { MetaMaskSDK } from '@metamask/sdk';
const { Buffer } = require('buffer');

export default {
  name: 'MetaMaskComponent',
  data() {
    return {
      sdk: null,
      account: null,
      chainId: null,
      connected: false,
      lastResponse: null,
      provider: null,
      availableLanguages: [],
      selectedLanguage: '',
    };
  },
  created() {
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        url: window.location.href,
        name: 'MetaMask VueJS Example Dapp',
      },
      // useDeeplink: true,
      enableAnalytics: true,
      checkInstallationImmediately: false,
      logging: {
        developerMode: true,
      },
      i18nOptions: {
        enabled: true,
      },
    });
  },
  async mounted() {
    // Init SDK
    await this.sdk?.init().then(() => {
      this.provider = this.sdk?.getProvider();
      // Chain changed
      this.provider?.on('chainChanged', (chain) => {
        console.log(`App::Chain changed:'`, chain);
        this.chainId = chain;
      });

      // Accounts changed
      this.provider?.on('accountsChanged', (accounts) => {
        console.log(`App::Accounts changed:'`, accounts);
        this.account = accounts[0];
      });

      // Connected event
      this.provider?.on('connect', (_connectInfo) => {
        console.log(`App::connect`, _connectInfo);
        this.onConnect();
        this.connected = true;
      });

      // Disconnect event
      this.provider?.on('disconnect', (error) => {
        console.log(`App::disconnect`, error);
        this.connected = false;
      });

      this.availableLanguages = this.sdk?.availableLanguages ?? ['en'];
    });
  },
  methods: {
    async onConnectAndSign() {
      try {
        const signResult = await this.sdk?.connectAndSign({
          msg: 'Connect + Sign message',
        });
        this.lastResponse = signResult;
      } catch (err) {
        console.warn(`failed to connect..`, err);
      }
    },
    async onConnect() {
      try {
        const res = await this.provider.request({
          method: 'eth_requestAccounts',
          params: [],
        });
        this.account = res[0];
        console.log('request accounts', res);
        this.lastResponse = '';
        this.chainId = this.provider.getChainId();
      } catch (e) {
        console.log('request accounts ERR', e);
      }
    },
    async addEthereumChain() {
      try {
        const res = await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon',
              blockExplorerUrls: ['https://polygonscan.com'],
              nativeCurrency: { symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://polygon-rpc.com/'],
            },
          ],
        });
        console.log('add', res);
        this.lastResponse = res;
      } catch (e) {
        console.log('ADD ERR', e);
      }
    },
    async eth_signTypedData_v4() {
      const msgParams = JSON.stringify({
        domain: {
          // Defining the chain aka Rinkeby testnet or Ethereum Main Net
          chainId: this.chainId,
          // Give a user-friendly name to the specific contract you are signing for.
          name: 'Ether Mail',
          // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          // Just lets you know the latest version. Definitely make sure the field name is correct.
          version: '1',
        },

        message: {
          contents: 'Hello, Bob!',
          attachedMoneyInEth: 4.2,
          from: {
            name: 'Cow',
            wallets: [
              '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
              '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
            ],
          },
          to: [
            {
              name: 'Bob',
              wallets: [
                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                '0xB0B0b0b0b0b0B000000000000000000000000000',
              ],
            },
          ],
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          // Not an EIP712Domain definition
          Group: [
            { name: 'name', type: 'string' },
            { name: 'members', type: 'Person[]' },
          ],
          // Refer to PrimaryType
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person[]' },
            { name: 'contents', type: 'string' },
          ],
          // Not an EIP712Domain definition
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallets', type: 'address[]' },
          ],
        },
      });

      let from = this.account;

      console.debug(`sign from: ${from}`);
      try {
        if (!from) {
          alert(
            `Invalid account -- please connect using eth_requestAccounts first`,
          );
          return;
        }

        const params = [from, msgParams];
        const method = 'eth_signTypedData_v4';
        console.debug(`ethRequest ${method}`, JSON.stringify(params, null, 4));
        console.debug(`sign params`, params);
        const result = await this.provider?.request({ method, params });
        this.lastResponse = result;
        console.debug(`eth_signTypedData_v4 result`, result);
      } catch (e) {
        this.lastResponse = e;
        console.error(e);
      }
    },
    async personal_sign() {
      try {
        const from = this.provider.getSelectedAddress();
        const message = 'Hello World from the VueJS Example dapp!';
        const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

        const sign = await window.ethereum.request({
          method: 'personal_sign',
          params: [hexMessage, from, 'Example password'],
        });
        console.log(`sign: ${sign}`);
        return sign;
      } catch (err) {
        console.log(err);
        return 'Error: ' + err.message;
      }
    },
    async sendTransaction() {
      const to = '0x0000000000000000000000000000000000000000';
      const transactionParameters = {
        to, // Required except during contract publications.
        from: this.provider.getSelectedAddress(), // must match user's active address.
        value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
      };

      try {
        // txHash is a hex string
        // As with any RPC call, it may throw an error
        const txHash = await this.provider.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        this.lastResponse = txHash;
      } catch (e) {
        console.log(e);
      }
    },
    async switchChain(chainId) {
      console.debug(`switching to network chainId=${chainId}`);
      try {
        const response = await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }], // chainId must be in hexadecimal numbers
        });
        console.debug(`response`, response);
      } catch (err) {
        console.error(err);
      }
    },
    async readOnlyCalls() {
      if (!this.sdk?.hasReadOnlyRPCCalls() && !this.provider) {
        this.lastResponse(
          'readOnlyCalls are not set and provider is not set. Please set your infuraAPIKey in the SDK Options',
        );
        return;
      }
      try {
        const result = await this.provider.request({
          method: 'eth_blockNumber',
          params: [],
        });
        const gotFrom = this.sdk.hasReadOnlyRPCCalls()
          ? 'infura'
          : 'MetaMask provider';
        this.lastResponse = `(${gotFrom}) ${result}`;
      } catch (e) {
        console.log(`error getting the blockNumber`, e);
        this.lastResponse = 'error getting the blockNumber';
      }
    },
    async changeLanguage() {
      localStorage.setItem('MetaMaskSDKLng', this.selectedLanguage);
      window.location.reload();
    },
    async batchCalls() {
      if (!this.provider?.getSelectedAddress()) {
        this.lastResponse = 'Please connect first';
        console.warn(`batchCalls: selectedAddress is not set`);
        return;
      }

      const rpcs = [
        {
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }],
        },
        {
          method: 'eth_sendTransaction',
          params: [
            {
              to: '0x0000000000000000000000000000000000000000', // Required except during contract publications.
              from: this.provider?.getSelectedAddress(), // must match user's active address.
              value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
            },
          ],
        },
        {
          method: 'personal_sign',
          params: ['hello world', this.account],
        },
        {
          method: 'personal_sign',
          params: ['Another one #3', this.account],
        },
      ];

      try {
        const response = await this.provider?.request({
          method: 'metamask_batch',
          params: rpcs,
        });
        this.lastResponse = response;
        response.forEach((r, i) => {
          console.log(`response ${i}`, r);
        });
      } catch (err) {
        console.error(err);
        this.lastResponse = err.message;
      }
    },
    terminate() {
      this.sdk?.terminate();
      this.account = null;
      this.lastResponse = 'Terminated!';
      this.chainId = null;
    },
  },
};
</script>

<style scoped>
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.info-status {
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  background-color: #c2ffc2;
  border: 1px solid darkolivegreen;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 20px;
  word-wrap: break-word;
  margin-top: 10px;
}

.metamask-container {
  text-align: center;
  padding: 16px;
}

.action-button {
  margin: 5px;
  background-color: darkolivegreen;
  border: 1px solid darkolivegreen;
  color: white;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.action-button-danger {
  background-color: red;
  border: 1px solid red;
  color: white;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 5px;
}

.action-button:hover {
  background-color: #c2ffc2;
  color: black;
}
</style>
