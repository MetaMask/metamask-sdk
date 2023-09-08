import { Duplex } from 'stream';
import {
  CommunicationLayerMessage,
  EventType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { onMessage } from '../services/RemoteCommunicationPostMessageStream/onMessage';
import { write } from '../services/RemoteCommunicationPostMessageStream/write';
import { PostMessageStream } from './PostMessageStream';

interface RemoteCommunicationPostMessageStreamState {
  _name: any;
  remote: RemoteCommunication | null;
  platformManager: PlatformManager | null;
  debug: boolean;
}

export class RemoteCommunicationPostMessageStream
  extends Duplex
  implements PostMessageStream
{
  public state: RemoteCommunicationPostMessageStreamState = {
    _name: null,
    remote: null,
    platformManager: null,
    debug: false,
  };

  constructor({
    name,
    remote,
    platformManager,
    debug,
  }: {
    name: ProviderConstants;
    remote: RemoteCommunication;
    platformManager: PlatformManager;
    debug: boolean;
  }) {
    super({
      objectMode: true,
    });
    this.state._name = name;
    this.state.remote = remote;
    this.state.debug = debug;
    this.state.platformManager = platformManager;

    this._onMessage = this._onMessage.bind(this);
    this.state.remote.on(EventType.MESSAGE, this._onMessage);
  }

  /**
   * Called when querying the sdk provider with ethereum.request
   */
  async _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    return write(this, chunk, _encoding, callback);
  }

  _read() {
    return undefined;
  }

  _onMessage(message: CommunicationLayerMessage) {
    return onMessage(this, message);
  }

  start() {
    // Ethereum.ethereum.isConnected = () => RemoteConnection.isConnected();
  }
}
