<template>
  <div class="metamask-container">
    <button class="action-button" @click="onConnect">CONNECT</button>
    <button class="action-button" @click="onSign">SIGN</button>
    <button class="action-button" @click="addEthereumChain">
      ADD POLYGON CHAIN
    </button>
  </div>
</template>

<script>
import { MetaMaskSDK } from '@metamask/sdk';

export default {
  name: 'MetaMaskComponent',
  data() {
    return {
      sdk: null,
      accounts: null,
    };
  },
  created() {
    this.sdk = new MetaMaskSDK({
      enableDebug: true,
      autoConnect: {
        enable: true,
      },
      logging: {
        developerMode: true,
      },
      storage: {
        enabled: true,
      },
    });
  },
  methods: {
    async onConnect() {
      try {
        const res = await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [],
        });
        this.accounts = res;
        console.log('request accounts', res);
      } catch (e) {
        console.log('request accounts ERR', e);
      }
    },
    async addEthereumChain() {
      try {
        const res = await window.ethereum.request({
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
      } catch (e) {
        console.log('ADD ERR', e);
      }
    },
    async onSign() {
      try {
        const from = this.accounts[0];
        const message = 'Hello, World!';
        // Convert the message to hexadecimal
        const hexMessage =
          '0x' + new Buffer.from(message, 'utf8').toString('hex');

        const sign = await window.ethereum.request({
          method: 'personal_sign',
          params: [hexMessage, from, 'Example password'],
        });

        console.log(sign);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style scoped>
.metamask-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.action-button {
  width: 100%;
  max-width: 400px;
  margin: 8px 0;
  padding: 12px;
  font-size: 16px;
  text-align: center;
  border: none;
  border-radius: 4px;
  background-color: #4a69bd;
  color: white;
  cursor: pointer;
}

.action-button:hover {
  background-color: #3c5bb0;
}

.spacer {
  height: 16px;
}

.deep-link {
  font-size: 16px;
  color: #4a69bd;
  text-decoration: none;
}

.deep-link:hover {
  text-decoration: underline;
}
</style>
