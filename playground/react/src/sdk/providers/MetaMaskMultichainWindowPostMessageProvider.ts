import type { JsonRpcRequest } from '@metamask/utils';

import MetaMaskMultichainBaseProvider from './MetaMaskMultichainBaseProvider';

// contexts
const CONTENT_SCRIPT = 'metamask-contentscript';
const INPAGE = 'metamask-inpage';
const MULTICHAIN_SUBSTREAM_NAME = 'metamask-multichain-provider';

class MetaMaskMultichainWindowPostMessageProvider extends MetaMaskMultichainBaseProvider {
  #listener: ((message: MessageEvent) => void) | null;

  constructor() {
    super();
    this.#listener = null;
  }

  async connect(): Promise<boolean> {
    if (this.#listener) {
      this.disconnect();
    }

    this.#listener = (messageEvent: MessageEvent) => {
      const { target, data } = messageEvent.data;
      if (target !== INPAGE || data?.name !== MULTICHAIN_SUBSTREAM_NAME) {
        return;
      }
      this._handleMessage(data.data);
    };

    window.addEventListener('message', this.#listener);

    return true;
  }

  _disconnect(): void {
    if (this.#listener !== null) {
      window.removeEventListener('message', this.#listener);
      this.#listener = null;
    }
  }

  isConnected(): boolean {
    return Boolean(this.#listener);
  }

  _sendRequest(request: JsonRpcRequest) {
    window.postMessage(
      {
        target: CONTENT_SCRIPT,
        data: {
          name: MULTICHAIN_SUBSTREAM_NAME,
          data: request,
        },
      },
      location.origin,
    );
  }
}

export default MetaMaskMultichainWindowPostMessageProvider;
