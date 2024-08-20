import {
  CommunicationLayerMessage,
  EventType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import { Duplex } from 'readable-stream';
import { PlatformManager } from '../Platform/PlatfformManager';
import { ProviderConstants } from '../constants';
import { onMessage } from '../services/RemoteCommunicationPostMessageStream/onMessage';
import { write } from '../services/RemoteCommunicationPostMessageStream/write';
import { PostMessageStream } from './PostMessageStream';

interface RemoteCommunicationPostMessageStreamState {
  _name: any;
  remote: RemoteCommunication | null;
  deeplinkProtocol: boolean;
  platformManager: PlatformManager | null;
}

export class RemoteCommunicationPostMessageStream
  extends Duplex
  implements PostMessageStream
{
  public state: RemoteCommunicationPostMessageStreamState = {
    _name: null,
    remote: null,
    deeplinkProtocol: false,
    platformManager: null,
  };

  constructor({
    name,
    remote,
    deeplinkProtocol,
    platformManager,
  }: {
    name: ProviderConstants;
    deeplinkProtocol: boolean;
    remote: RemoteCommunication;
    platformManager: PlatformManager;
  }) {
    super({
      objectMode: true,
    });
    this.state._name = name;
    this.state.remote = remote;
    this.state.deeplinkProtocol = deeplinkProtocol;
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
