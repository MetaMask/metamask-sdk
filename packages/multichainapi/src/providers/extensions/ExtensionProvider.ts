/// <reference types="chrome"/>
// packages/multichainapi/src/providers/ExtensionProvider.ts
import type { Provider } from '../BaseProvider';
import type { MethodParams } from '../../types';

interface ExtensionResponse {
  id?: number;
  result?: unknown;
  error?: {
    message: string;
    code?: number;
  };
}

type NotificationCallback = (notification: unknown) => void;

export class ExtensionProvider implements Provider {
  #port: chrome.runtime.Port | null;
  #requestMap: Map<
    number,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >;
  #nextId: number;
  #notificationCallbacks: Set<NotificationCallback>;

  constructor() {
    this.#port = null;
    this.#requestMap = new Map();
    this.#nextId = 1;
    this.#notificationCallbacks = new Set();
  }

  async connect(extensionId: string): Promise<boolean> {
    if (this.#port) {
      this.disconnect();
    }

    this.#port = chrome.runtime.connect(extensionId);
    let isConnected = true;

    this.#port.onDisconnect.addListener(() => {
      isConnected = false;
      const errorMessage = chrome.runtime.lastError
        ? chrome.runtime.lastError.message
        : 'Port disconnected unexpectedly.';
      console.error('Error connecting to extension:', errorMessage);
      this.#port = null;
      this.#requestMap.clear();
    });

    // Wait for connection confirmation
    await new Promise((resolve) => setTimeout(resolve, 5));

    if (!isConnected) {
      throw new Error(
        'Error connecting to MetaMask Multichain Provider. Extension not found or disabled.',
      );
    }

    this.#port.onMessage.addListener(this.#handleMessage.bind(this));

    try {
      this.#port.postMessage('ping');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.#port) {
      this.#port.disconnect();
      this.#port = null;
    }
    this.#requestMap.clear();
    this.removeAllNotificationListeners();
  }

  async request(params: MethodParams): Promise<unknown> {
    if (!this.#port) {
      throw new Error('Not connected to extension. Call connect() first.');
    }

    const id = this.#nextId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method: params.method,
      params: params.params,
      scope: params.chainId, // Include CAIP-2 chainId as scope
    };

    return new Promise((resolve, reject) => {
      this.#requestMap.set(id, { resolve, reject });
      this.#port?.postMessage({ type: 'caip-request', data: request });

      // Request timeout after 30 seconds
      setTimeout(() => {
        if (this.#requestMap.has(id)) {
          this.#requestMap.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  #handleMessage(message: { data: ExtensionResponse }): void {
    const { data } = message;
    if (data.id && this.#requestMap.has(data.id)) {
      const { resolve, reject } = this.#requestMap.get(data.id) ?? {};
      this.#requestMap.delete(data.id);

      if (resolve && reject) {
        if (data.error) {
          reject(new Error(data.error.message));
        } else {
          resolve(data.result);
        }
      }
    } else if (!data.id) {
      this.#notifyCallbacks(data);
    }
  }

  onNotification(callback: NotificationCallback): void {
    this.#notificationCallbacks.add(callback);
  }

  removeNotificationListener(callback: NotificationCallback): void {
    this.#notificationCallbacks.delete(callback);
  }

  removeAllNotificationListeners(): void {
    this.#notificationCallbacks.clear();
  }

  #notifyCallbacks(notification: unknown): void {
    this.#notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }
}
