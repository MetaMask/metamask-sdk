import type { JsonRpcRequest } from '@metamask/utils';

import MetaMaskMultichainBaseProvider from './MetaMaskMultichainBaseProvider';

class MetaMaskMultichainExternallyConnectableProvider extends MetaMaskMultichainBaseProvider {
  #port: chrome.runtime.Port | null;

  constructor() {
    super();
    this.#port = null;
  }

  async connect(extensionId: string): Promise<boolean> {
    if (this.#port) {
      this.disconnect();
    }

    this.#port = chrome.runtime.connect(extensionId);

    this.#port.onDisconnect.addListener(() => {
      this.#port = null;
      const errorMessage = chrome.runtime.lastError
        ? chrome.runtime.lastError.message
        : 'Port disconnected unexpectedly.';
      console.error('Error connecting to extension:', errorMessage);
      this.disconnect();
    });

    // Wait for the next tick to allow onDisconnect to fire if there's an error
    // This is an unfortunate hack required to ensure the port is connected before
    // we declare the connection successful.
    // This gives a few ticks for the onDisconnect listener to fire if the runtime
    // connection fails because the extension for the given extensionId is not present.
    await new Promise((resolve) => setTimeout(resolve, 5));

    if (!this.isConnected()) {
      console.error(
        'Error connecting to MetaMask Multichain Provider. Make sure the Multichain Enable MetaMask extension is installed and enabled.',
      );
      return false;
    }

    this.#port.onMessage.addListener((message) => {
      const { type, data } = message;
      if (type !== 'caip-348') {
        return;
      }
      this._handleMessage(data);
    });

    try {
      this.#port.postMessage('ping');
      console.log(
        'Connected to MetaMask Multichain Provider via externally_connectable',
      );
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  _disconnect(): void {
    if (this.#port) {
      this.#port.disconnect();
      this.#port = null;
    }
  }

  isConnected(): boolean {
    return Boolean(this.#port);
  }

  _sendRequest(request: JsonRpcRequest) {
    this.#port?.postMessage({ type: 'caip-348', data: request });
  }
}

export default MetaMaskMultichainExternallyConnectableProvider;
