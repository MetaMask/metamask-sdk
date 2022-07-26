import { Duplex } from 'stream';
import { Buffer } from 'buffer';
import WalletConnect from '../services/WalletConnect';
import { METHODS_TO_REDIRECT, ProviderConstants } from '../constants';
import Ethereum from '../services/Ethereum';
import Platform, { PlatformName } from '../Platform';

class WalletConnectPostMessageStream extends Duplex {
  private _alreadySubscribed: any;

  private _name: any;

  constructor({ name }) {
    super({
      objectMode: true,
    });
    this._name = name;
  }

  _write(msg, _encoding, callback) {
    if (!WalletConnect.isConnected()) {
      return callback();
    }

    try {
      let data;
      if (Buffer.isBuffer(msg)) {
        data = msg.toJSON();
        // @ts-ignore
        data._isBuffer = true;
      } else {
        data = msg;
      }

      WalletConnect.getConnector()
        .sendCustomRequest(data?.data)
        .then((result) => {
          const res = {
            data: {
              name: ProviderConstants.PROVIDER,
              data: {
                id: data.data.id,
                jsonrpc: '2.0',
                result,
              },
            },
            target: ProviderConstants.INPAGE,
          };
          // Returns request result
          this._onMessage(res);
        })
        .catch((error) => {
          // Error returned when rejected
          const res = {
            data: {
              name: ProviderConstants.PROVIDER,
              data: {
                id: data.data.id,
                jsonrpc: '2.0',
                error: error.toString(),
              },
            },
            target: ProviderConstants.INPAGE,
          };

          // Returns request result
          this._onMessage(res);
        });

      const isDesktop = Platform.getPlatform() === PlatformName.DesktopWeb;

      // Check if should open app
      if (METHODS_TO_REDIRECT[data?.data?.method] && !isDesktop) {
        Platform.openDeeplink(
          'https://metamask.app.link/',
          'metamask://',
          '_self',
        );
      }
    } catch (err) {
      return callback(
        new Error('RemoteCommunicationPostMessageStream - disconnected'),
      );
    }

    return callback();
  }

  _read() {
    return undefined;
  }

  _onMessage(event) {
    const msg = event.data;
    // validate message
    /* if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }*/
    if (!msg || typeof msg !== 'object') {
      return;
    }

    if (!msg.data || typeof msg.data !== 'object') {
      return;
    }

    if (event.target && event.target !== this._name) {
      return;
    }

    if (Buffer.isBuffer(msg)) {
      // @ts-ignore
      delete msg._isBuffer;
      const data = Buffer.from(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  setProviderState({ chainId, accounts }) {
    const resChainChanged = {
      data: {
        name: ProviderConstants.PROVIDER,
        data: {
          method: 'metamask_chainChanged',
          params: {
            chainId: `0x${parseInt(chainId, 10).toString(16)}`,
            // For compatibility purposes
            networkVersion: chainId.toString(),
          },
        },
      },
      target: ProviderConstants.INPAGE,
    };

    const resAccountsChanged = {
      data: {
        name: ProviderConstants.PROVIDER,
        data: {
          method: 'metamask_accountsChanged',
          params: [accounts[0]],
        },
      },
      target: ProviderConstants.INPAGE,
    };

    this._onMessage(resChainChanged);
    this._onMessage(resAccountsChanged);

    // No problem in checking the provider state again
    Ethereum.ethereum._state.initialized = true;
    Ethereum.ethereum._initializeState();
  }

  subscribeToConnectionEvents() {
    if (WalletConnect.forceRestart) {
      WalletConnect.getConnector().killSession();
      WalletConnect.forceRestart = false;
    }

    if (WalletConnect.isConnected()) {
      Ethereum.ethereum._state.initialized = true;
      Ethereum.ethereum._initializeState();
    }

    if (this._alreadySubscribed) {
      return;
    }

    // Subscribe to connection events
    WalletConnect.getConnector().on('connect', (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setProviderState({ chainId, accounts });
    });

    WalletConnect.getConnector().on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setProviderState({ accounts, chainId });
    });

    WalletConnect.getConnector().on('disconnect', (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete connector
      location.reload();
    });
    this._alreadySubscribed = true;
  }

  start() {
    this.subscribeToConnectionEvents();
  }
}

export default WalletConnectPostMessageStream;
