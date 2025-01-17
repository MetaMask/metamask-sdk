// packages/multichainapi/src/providers/ExtensionProvider.ts

/// <reference types="chrome"/>
import type { Provider } from './BaseProvider';
import type { LoggerLike, MethodParams } from '../types';
import { Json } from '@metamask/utils';

interface ExtensionResponse {
  id?: number;
  result?: unknown;
  error?: {
    message: string;
    code?: number;
  };
}

type NotificationCallback = (notification: Json) => void;

interface ConnectParams {
  extensionId: string;
}

export class ExtensionProvider implements Provider {
  #port: chrome.runtime.Port | null;
  #requestMap: Map<number, { resolve: (v: unknown) => void; reject: (r?: unknown) => void }>;
  #nextId: number;
  #notificationCallbacks: Set<NotificationCallback>;
  #fallbackMode: boolean;
  #logger?: LoggerLike;

  constructor(params?: { logger?: LoggerLike}) {
    this.#port = null;
    this.#requestMap = new Map();
    this.#nextId = 1;
    this.#notificationCallbacks = new Set();
    this.#fallbackMode = false;
    this.#logger = params?.logger ?? console;
    this.#logger?.debug('[ExtensionProvider] Initialized');
  }

  public async connect({ extensionId }: ConnectParams): Promise<boolean> {
    this.#logger?.debug('[ExtensionProvider] Attempting to connect:', extensionId);

    // Clear any existing state first
    if (this.#port) {
      this.#logger?.debug('[ExtensionProvider] Existing connection found, disconnecting');
      this.disconnect();
    }

    // Attempt chromium connection if available
    const canUseChrome = typeof chrome !== 'undefined'
      && chrome.runtime
      && typeof chrome.runtime.connect === 'function';

    if (canUseChrome) {
      return this.#connectChromium({ extensionId });
    }

    // Otherwise fallback approach
    this.#fallbackMode = true;
    return this.#connectFallback({ extensionId });
  }

  public disconnect(): void {
    this.#logger?.debug('[ExtensionProvider] Disconnecting');
    if (this.#port) {
      this.#port.disconnect();
      this.#port = null;
    }
    this.#requestMap.clear();
    this.removeAllNotificationListeners();
    this.#fallbackMode = false;
    this.#logger?.debug('[ExtensionProvider] Disconnected and reset');
  }

  public async request(params: MethodParams): Promise<unknown> {
    if (!this.#fallbackMode) {
      return this.#requestChromium(params);
    }
    return this.#requestFallback(params);
  }

  public onNotification(callback: NotificationCallback): void {
    this.#logger?.debug('[ExtensionProvider] Adding notification listener');
    this.#notificationCallbacks.add(callback);
  }

  public removeNotificationListener(callback: NotificationCallback): void {
    this.#logger?.debug('[ExtensionProvider] Removing notification listener');
    this.#notificationCallbacks.delete(callback);
  }

  public removeAllNotificationListeners(): void {
    this.#logger?.debug('[ExtensionProvider] Removing all notification listeners');
    this.#notificationCallbacks.clear();
  }

  // =========================================================================
  // Private: Chromium-Connection Logic
  // =========================================================================

  async #connectChromium({ extensionId }: ConnectParams): Promise<boolean> {
    this.#logger?.debug('[ExtensionProvider] #connectChromium to:', extensionId);

    this.#port = chrome.runtime.connect(extensionId);

    let isConnected = true;
    this.#port.onDisconnect.addListener(() => {
      isConnected = false;
      const errorMessage = chrome.runtime.lastError
        ? chrome.runtime.lastError.message
        : 'Port disconnected unexpectedly.';
      this.#logger?.error('[ExtensionProvider] Connection error:', errorMessage);
      this.#port = null;
      this.#requestMap.clear();
    });

    // Use same timing as working implementation
    await new Promise((resolve) => setTimeout(resolve, 5));

    if (!isConnected) {
      this.#logger?.error('[ExtensionProvider] Connect failed - port disconnected');
      return false;
    }

    this.#port.onMessage.addListener(this.#handleChromiumMessage.bind(this));

    try {
      this.#port.postMessage('ping');
      return true;
    } catch (err) {
      this.#logger?.error('[ExtensionProvider] Ping error:', err);
      return false;
    }
  }

  #requestChromium(params: MethodParams): Promise<unknown> {
    if (!this.#port) {
      throw new Error('Not connected to extension. Call connect() first.');
    }

    const id = this.#nextId++;

    // Format request based on method type
    const request = {
      jsonrpc: '2.0',
      id,
      method: params.method,
      params: params.params,
    };

    this.#logger?.debug('[ExtensionProvider] Sending chromium request:', request);

    return new Promise((resolve, reject) => {
      this.#requestMap.set(id, { resolve, reject });
      this.#port?.postMessage({ type: 'caip-x', data: request });

      setTimeout(() => {
        if (this.#requestMap.has(id)) {
          this.#logger?.warn('[ExtensionProvider] Request timeout for id:', id);
            this.#requestMap.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  #handleChromiumMessage(message: { data: ExtensionResponse }): void {
    const { data } = message;
    this.#logger?.debug('[ExtensionProvider] Received chromium message:', data);
    this.#handleResponse(data);
  }

  // =========================================================================
  // Private: Fallback-Connection Logic
  // =========================================================================

  async #connectFallback({ extensionId }: ConnectParams): Promise<boolean> {
    this.#logger?.debug('[ExtensionProvider] #connectFallback to:', extensionId);

    // Possibly store extensionId or post a request event
    window.postMessage(
      {
        type: 'MULTICHAIN_CONNECT_REQUEST', // FIXME: what should we actually use?
        extensionId,
      },
      '*',
    );

    // Listen for events from extension
    window.addEventListener('message', this.#handleFallbackMessage.bind(this));

    // Example: immediately assume success for demonstration
    return true;
  }

  #requestFallback(params: MethodParams): Promise<unknown> {
    const id = this.#nextId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method: params.method,
      params: params.params,
      scope: params.chainId,
    };

    this.#logger?.debug('[ExtensionProvider] Sending fallback request:', request);

    return new Promise((resolve, reject) => {
      this.#requestMap.set(id, { resolve, reject });

      window.postMessage(
        {
          type: 'caip-request',
          data: request,
        },
        '*',
      );

      setTimeout(() => {
        if (this.#requestMap.has(id)) {
          this.#logger?.warn('[ExtensionProvider] Request timeout for id:', id);
          this.#requestMap.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  #handleFallbackMessage(event: MessageEvent): void {
    if (event.data?.type !== 'caip-response') {
      return;
    }
    const response = event.data?.data as ExtensionResponse;
    this.#logger?.debug('[ExtensionProvider] Received fallback message:', response);
    this.#handleResponse(response);
  }

  // =========================================================================
  // Private: Shared Response Handling
  // =========================================================================

  #handleResponse(data: ExtensionResponse): void {
    if (data.id && this.#requestMap.has(data.id)) {
      const { resolve, reject } = this.#requestMap.get(data.id) ?? {};
      this.#requestMap.delete(data.id);

      if (resolve && reject) {
        if (data.error) {
          this.#logger?.error('[ExtensionProvider] Request error for id:', data.id, data.error);
          reject(new Error(data.error.message));
        } else {
          this.#logger?.debug('[ExtensionProvider] Request success for id:', data.id);
          resolve(data.result);
        }
      }
    } else if (!data.id) {
      this.#logger?.debug('[ExtensionProvider] Received notification');
      this.#notifyCallbacks(data as Json);
    }
  }

  #notifyCallbacks(notification: Json): void {
    this.#logger?.debug('[ExtensionProvider] Notifying callbacks:', {
      callbackCount: this.#notificationCallbacks.size,
    });

    this.#notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        this.#logger?.error('[ExtensionProvider] Error in notification callback:', error);
      }
    });
  }
}
