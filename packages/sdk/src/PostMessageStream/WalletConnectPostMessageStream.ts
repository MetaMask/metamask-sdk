/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Buffer } from 'buffer';
import { Duplex } from 'stream';
import { METHODS_TO_REDIRECT } from '../config';
import { ProviderConstants } from '../constants';
import { Platform } from '../Platform/Platfform';
import { Ethereum } from '../services/Ethereum';
import { PlatformType } from '../types/PlatformType';
import { PostMessageStream } from './PostMessageStream';

export class WalletConnectPostMessageStream
  extends Duplex
  implements PostMessageStream
{
  private _alreadySubscribed = false;

  private _name: string;

  // TODO get type
  wcConnector: any;

  constructor({ name, wcConnector }: { name: string; wcConnector: any }) {
    super({
      objectMode: true,
    });
    this._name = name;
    this.wcConnector = wcConnector;
  }

  _write(
    chunk: any,
    _encoding: BufferEncoding,
    _cb: (error?: Error | null) => void,
  ) {
    if (!this.wcConnector.isConnected()) {
      return _cb();
    }

    try {
      let data: any;
      if (Buffer.isBuffer(chunk)) {
        data = chunk.toJSON();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data._isBuffer = true;
      } else {
        data = chunk;
      }

      this.wcConnector
        .sendCustomRequest(data?.data)
        .then((result: any) => {
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
        .catch((error: Error) => {
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

      const platform = Platform.getInstance();
      const isDesktop = platform.getPlatformType() === PlatformType.DesktopWeb;

      const targetMethod = data?.data
        ?.method as keyof typeof METHODS_TO_REDIRECT;
      // Check if should open app
      if (METHODS_TO_REDIRECT[targetMethod] && !isDesktop) {
        platform.openDeeplink(
          'https://metamask.app.link/',
          'metamask://',
          '_self',
        );
      }
    } catch (err) {
      return _cb(
        new Error('RemoteCommunicationPostMessageStream - disconnected'),
      );
    }

    return _cb();
  }

  _read() {
    return undefined;
  }

  // TODO find correct mesage format
  _onMessage(event: any) {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete msg._isBuffer;
      const data = Buffer.from(msg);
      this.push(data);
    } else {
      this.push(msg);
    }
  }

  setProviderState({
    chainId,
    accounts,
  }: {
    chainId: string;
    accounts: string[];
  }) {
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

    // // No problem in checking the provider state again
    // const provider = Ethereum.getProvider();
    // // // FIXME not enough time to implement but should enver use ts-ignore
    // // // instead we should extend the provider and have an accessible initialization method.
    // // // @ts-ignore
    // // provider._state.initialized = true;
    // // // @ts-ignore
    // // provider._initializeState();
  }

  subscribeToConnectionEvents() {
    if (this.wcConnector.forceRestart) {
      this.wcConnector.killSession();
      this.wcConnector.forceRestart = false;
    }

    if (this.wcConnector.isConnected()) {
      // @ts-ignore
      provider._state.initialized = true;
      // @ts-ignore
      provider._initializeState();
    }

    if (this._alreadySubscribed) {
      return;
    }

    // Subscribe to connection events
    this.wcConnector.on('connect', (error: Error, payload: any) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setProviderState({ chainId, accounts });
    });

    this.wcConnector.on('session_update', (error: Error, payload: any) => {
      if (error) {
        throw error;
      }
      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      this.setProviderState({ accounts, chainId });
    });

    this.wcConnector.on('disconnect', (error: Error) => {
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
