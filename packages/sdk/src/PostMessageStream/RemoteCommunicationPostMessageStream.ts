/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Buffer } from 'buffer';
import { Duplex } from 'stream';
import {
  MessageType,
  RemoteCommunication,
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

  remote: RemoteCommunication;

  constructor({
    name,
    remote,
  }: {
    name: ProviderConstants;
    remote: RemoteCommunication;
  }) {
    super({
      objectMode: true,
    });
    this._name = name;
    this.remote = remote;

    this._onMessage = this._onMessage.bind(this);
    this.remote.on(MessageType.MESSAGE, this._onMessage);

    this.remote.on(MessageType.CLIENTS_READY, () => {
      console.debug(`clients is ready! start provider initialization!`);
      const provider = Ethereum.getProvider();
      // // FIXME not enough time to implement but should enver use ts-ignore
      // // instead we should extend the provider and have an accessible initialization method.
      // // @ts-ignore
      // provider._state.initialized = true;
      // @ts-ignore
      provider._initializeState();
    });

    this.remote.on(MessageType.CLIENTS_DISCONNECTED, () => {
      // FIXME same issue as stated above
      const provider = Ethereum.getProvider();
      // @ts-ignore
      provider._handleAccountsChanged([]);
      // @ts-ignore
      provider._handleDisconnect(true);
    });
  }

  _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    if (!this.remote.isConnected()) {
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
      if (isDesktop) {
        return callback();
      }
      const targetMethod = data?.data
        ?.method as keyof typeof METHODS_TO_REDIRECT;
      // Check if should open app
      if (METHODS_TO_REDIRECT[targetMethod]) {
        platform.openDeeplink(
          'https://metamask.app.link/',
          'metamask://',
          '_self',
        );
      } else if (this.remote.isPaused() && !isDesktop) {
        platform.openDeeplink(
          'https://metamask.app.link/connect?redirect=true',
          'metamask://connect?redirect=true',
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

  _onMessage({
    message,
  }: {
    message: { data: Record<string, unknown>; name: unknown };
  }) {
    console.debug(`RemoteCommunicationPostMessageStream._onMessage`, message);
    // validate message
    /* if (this._origin !== '*' && event.origin !== this._origin) {
      return;
    }*/

    if (!message || typeof message !== 'object') {
      return;
    }

    if (!message.data || typeof message.data !== 'object') {
      return;
    }

    if (message.name && message.name !== ProviderConstants.PROVIDER) {
      return;
    }

    if (Buffer.isBuffer(message)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete msg._isBuffer;
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
