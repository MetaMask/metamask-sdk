<template>
  <div class="metamask-container">
    <button class="action-button" @click="onConnect">CONNECT</button>
    <button class="action-button" @click="onSign">SIGN</button>
    <button class="action-button" @click="addEthereumChain">
      ADD POLYGON CHAIN
    </button>
    <button class="action-button" @click="terminate">TERMINATE</button>
    <div class="spacer">
      {{connected ? 'CONNECTED' : 'NOT CONNECTED'}}
    </div>
    <div class="spacer">
      Accounts:
      <ul>
        <li v-for='account in accounts' :key='account'>
          {{account}}
        </li>
      </ul>
    </div>
    <div class="spacer">
      ChainId: {{chainId}}
    </div>
    <div class="spacer">
      Last response: {{lastResponse}}
    </div>
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
      accounts: null,
      chainId: null,
      connected: false,
      lastResponse: null,
    };
  },
  created() {
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        url: window.location.href,
        name: 'MetaMask VueJS Example Dapp',
      },
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
  mounted() {
    if (this.sdk?.isInitialized()) {
      // Chain changed
      window.ethereum?.on("chainChanged", (chain) => {
        console.log(`App::Chain changed:'`, chain);
        this.chainId = chain;
      });

      // Accounts changed
      window.ethereum?.on("accountsChanged", (accounts) => {
        console.log(`App::Accounts changed:'`, accounts);
        this.accounts = accounts;
      });

      // Initialized event
      window.ethereum?.on('_initialized', () => {
        console.debug(`App::useEffect on _initialized`);
        // Getting the accounts again to display in the UI
        this.onConnect();
        if (window.ethereum?.chainId) {
          this.chainId = window.ethereum.chainId;
        }
      });

      // Connected event
      window.ethereum?.on('connect', (_connectInfo) => {
        console.log(`App::connect`, _connectInfo);
        this.connected = true;
      });

      // Disconnect event
      window.ethereum?.on('disconnect', (error) => {
        console.log(`App::disconnect`, error);
        this.connected = false;
      });
    }

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
        this.lastResponse = "";
        this.chainId = window.ethereum.chainId;
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
        this.lastResponse = res;
      } catch (e) {
        console.log('ADD ERR', e);
      }
    },
    async onSign() {
      try {
        const from = window.ethereum?.selectedAddress;
        const message = 'Hello World from the Vue Example dapp!';
        const hexMessage = '0x' + Buffer.from(message, 'utf8').toString('hex');

        const sign = await window.ethereum.request({
          method: 'personal_sign',
          params: [hexMessage, from, 'Example password'],
        });
        console.log(sign);
        this.lastResponse = sign;
      } catch (err) {
        console.error(err);
      }
    },
    terminate() {
      this.sdk?.terminate();
      this.accounts = null;
      this.lastResponse = "Terminated!";
      this.chainId = null;
    }
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
  margin: 20px;
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
