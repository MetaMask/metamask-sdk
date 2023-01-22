import { Duplex } from 'stream';
import { Buffer } from 'buffer';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  MessageType,
  RemoteCommunication,
  CommunicationLayerMessage,
} from '@metamask/sdk-communication-layer';
import { METHODS_TO_REDIRECT } from '../config';
import { ProviderConstants } from '../constants';
import { Platform } from '../Platform/Platfform';
import { Ethereum } from '../services/Ethereum';
import { PlatformType } from '../types/PlatformType';
import { PostMessageStream } from './PostMessageStream';

export class RemoteCommunicationPostMessageStream
  extends Duplex
  implements PostMessageStream
{
  private _name: any;

  private remote: RemoteCommunication;

  private debug;

  constructor({
    name,
    remote,
    debug,
  }: {
    name: ProviderConstants;
    remote: RemoteCommunication;
    debug: boolean;
  }) {
    super({
      objectMode: true,
    });
    this._name = name;
    this.remote = remote;
    this.debug = debug;

    this._onMessage = this._onMessage.bind(this);
    this.remote.on(MessageType.MESSAGE, this._onMessage);

    this.remote.on(MessageType.CLIENTS_READY, async () => {
      try {
        const provider = Ethereum.getProvider();
        // FIXME should never use ts-ignore, but currently have to because we are using @metamask/providers -> initializeProvider which prevent
        // creating our own custom Provider extending the BaseProvider.
        // instead we should extend the provider and have an accessible initialization method.

        // @ts-ignore
        provider._state.initialized = false;
        // @ts-ignore
        await provider._initializeStateAsync();
        if (debug) {
          console.debug(
            `RCPMS::on 'clients_ready' provider.state`, // @ts-ignore
            provider._state,
          );
        }
      } catch (err) {
        // Ignore error if already initialized.
        // console.debug(`IGNORE ERROR`, err);
      }

      const isInstalled = Platform.getInstance().isMetaMaskInstalled();
      if (this.debug) {
        console.debug(
          `'[RCPMS] clients_ready' - ethereum provider initialized,  isInstalled=${isInstalled}`,
        );
      }
    });

    this.remote.on(MessageType.CLIENTS_DISCONNECTED, () => {
      if (this.debug) {
        console.debug(`[RCPMS] received '${MessageType.CLIENTS_DISCONNECTED}'`);
      }

      // FIXME same issue as stated above
      const provider = Ethereum.getProvider();
      // @ts-ignore
      provider._state.isConnected = false;
      provider.emit('disconnect', '');
    });
  }

  _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    if (!this.remote.isConnected()) {
      if (this.debug) {
        console.log(`[RCPMS] NOT CONNECTED - EXIT`, chunk);
      }

      return callback();
    }

    try {
      let data;
      if (Buffer.isBuffer(chunk)) {
        data = chunk.toJSON();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data._isBuffer = true;
      } else {
        data = chunk;
      }

      this.remote.sendMessage(data?.data);
      const platform = Platform.getInstance();

      const isDesktop = platform.getPlatformType() === PlatformType.DesktopWeb;
      const isNotBrowser = platform.isNotBrowser();
      const isReactNative = platform.isReactNative();

      if (!isReactNative && (isDesktop || isNotBrowser)) {
        // Redirect early if nodejs or browser...
        if (this.debug) {
          console.log(
            `RCPMS::_write isDektop=${isDesktop} isNotBrowser=${isNotBrowser}`,
          );
        }
        return callback();
      }

      const targetMethod = data?.data
        ?.method as keyof typeof METHODS_TO_REDIRECT;
      // Check if should open app
      if (METHODS_TO_REDIRECT[targetMethod] && !isDesktop) {
        if (this.debug) {
          console.debug(
            `RCPMS::_write redirect link for '${targetMethod}'`,
            'metamasl://',
          );
        }

        platform.openDeeplink(
          'https://metamask.app.link/',
          'metamask://',
          '_self',
        );
      } else if (this.remote.isPaused() && !isDesktop) {
        if (this.debug) {
          console.debug(`RCPMS::_write MM is PAUSED! deeplink with connect!`);
        }

        platform.openDeeplink(
          'https://metamask.app.link/connect?redirect=true',
          'metamask://connect?redirect=true',
          '_self',
        );
      }
    } catch (err) {
      console.error(err);
      return callback(
        new Error('RemoteCommunicationPostMessageStream - disconnected'),
      );
    }

    return callback();
  }

  _read() {
    return undefined;
  }

  _onMessage(message: CommunicationLayerMessage) {
    // validate message
    /* if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }*/
    if (this.debug) {
      console.debug(`[RCPMS] _onMessage `, message);
    }

    const typeOfMsg = typeof message;

    if (!message || typeOfMsg !== 'object') {
      return;
    }

    // We only want reply from MetaMask.
    const typeOfData = typeof message?.data;
    if (typeOfData !== 'object') {
      return;
    }

    if (!message?.name) {
      return;
    }

    if (message?.name !== ProviderConstants.PROVIDER) {
      return;
    }

    if (Buffer.isBuffer(message)) {
      const data = Buffer.from(message);
      this.push(data);
    } else {
      this.push(message);
    }
  }

  start() {
    // Ethereum.ethereum.isConnected = () => RemoteConnection.isConnected();
  }
}
