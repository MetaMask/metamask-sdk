import { BasePostMessageStream } from '@metamask/post-message-stream/dist/BasePostMessageStream';
/**
 * Window.postMessage stream.
 */
class RemoteCommunicationPostMessageStream extends BasePostMessageStream {
  private _name: any;

  private _target: string;

  /**
   * Creates a stream for communicating with other streams across the same or
   * different window objects.
   *
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.targetWindow - The window object of the target stream. Defaults
   * to `window`.
   */
  constructor({ name, target }) {
    if (!name || !target) {
      throw new Error('Invalid input.');
    }
    super();
    this._name = name;
    this._target = target;
    this._onMessage = this._onMessage.bind(this);
    this._handshake();
  }

  _postMessage(data) {}

  _onMessage(event) {
    const message = event.data;
    // validate message
    if (
      typeof message !== 'object' ||
      message.target !== this._name ||
      !message.data
    ) {
      return;
    }
    this._onData(message.data);
  }

  _destroy() {}
}

export default RemoteCommunicationPostMessageStream;
