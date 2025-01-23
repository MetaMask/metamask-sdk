// packages/sdk-multichain/src/providers/ExtensionProvider.ts

/// <reference types="chrome"/>
import type { Duplex } from 'readable-stream';
import { MetaMaskInpageProvider, RequestArguments } from '@metamask/providers';
import type { LoggerLike, MethodParams, Provider } from '../types';

export enum ProviderType {
  CHROME_EXTENSION = 'chrome_extension',
  EIP1193_PROVIDER = 'eip1193_provider',
  STREAM_PROVIDER = 'stream_provider',
}

/**
 * Configuration object for ExtensionProvider
 */
interface ExtensionProviderConfig {
  logger?: LoggerLike;
  /**
   * A Duplex stream, e.g. from getPostMessageStream or
   * a network socket for mobile. If provided, we skip or fallback to it
   * if chrome.connect is unavailable.
   */
  existingStream?: Duplex;

  /**
   * If there's an existing provider object (some EIP-1193 instance)
   * to reuse, it can be passed here. This overrides all other
   * connection attempts.
   */
  eip1193Provider?: MetaMaskInpageProvider;

  preferredProvider?: ProviderType;
}

/**
 * ConnectParams might hold the extensionId for the chrome externally_connectable approach
 */
interface ConnectParams {
  extensionId?: string;
}

export class ExtensionProvider implements Provider {
  private readonly logger?: LoggerLike;
  private readonly existingProvider?: MetaMaskInpageProvider;
  private readonly existingStream?: Duplex;
  private readonly preferredProvider?: ProviderType;
  private isConnected = false;
  private chromePort: chrome.runtime.Port | null = null;
  private streamProvider?: MetaMaskInpageProvider;

  /**
   * Storing notification callbacks.
   * If we detect a "notification" (a message without an id) coming from
   * the extension or fallback, we'll call each callback in here.
   */
  private notificationCallbacks: Set<(data: unknown) => void> = new Set();

  constructor(config?: ExtensionProviderConfig) {
    this.logger = config?.logger ?? console;
    this.existingProvider = config?.eip1193Provider;
    this.existingStream = config?.existingStream;
    this.preferredProvider = config?.preferredProvider;

    this.logger?.debug('[ExtensionProvider] Initialized with:', {
      hasExistingProvider: !!this.existingProvider,
      hasExistingStream: !!this.existingStream,
      preferredProvider: this.preferredProvider,
    });
  }

  /**
   * Attempts to connect. If extensionId is provided and environment supports
   * chrome.runtime, tries that first. Otherwise uses existing provider, etc.
   */
  public async connect(params?: ConnectParams): Promise<boolean> {
    this.logger?.debug('[ExtensionProvider] Connect called with:', {
      params,
      preferredProvider: this.preferredProvider,
      hasExistingProvider: !!this.existingProvider,
      hasExistingStream: !!this.existingStream,
      canUseChromeRuntime: this.canUseChromeRuntime(),
    });

    // First check if we have an existing provider
    if (this.existingProvider) {
      this.logger?.debug('[ExtensionProvider] Using existing provider');
      this.isConnected = true;
      return true;
    }

    // Then try other connection methods
    try {
      if (params?.extensionId && this.canUseChromeRuntime()) {
        this.logger?.debug('[ExtensionProvider] Attempting Chrome extension connection');
        const success = await this.connectChrome(params.extensionId);
        if (success) {
          this.isConnected = true;
          return true;
        }
      }

      if (this.existingStream) {
        this.logger?.debug('[ExtensionProvider] Using existing stream');
        this.wrapStreamAsProvider(this.existingStream);
        this.isConnected = true;
        return true;
      }

      this.logger?.error('[ExtensionProvider] No valid provider available');
      throw new Error('No valid provider available');
    } catch (error) {
      this.logger?.error('[ExtensionProvider] Connection failed:', error);
      throw error;
    }
  }

  public disconnect() {
    this.logger?.debug('[ExtensionProvider] disconnecting...');

    // Disconnect Chrome port if it exists
    if (this.chromePort) {
      try {
        this.chromePort.disconnect();
        this.chromePort = null;
      } catch (error) {
        this.logger?.error('[ExtensionProvider] Error disconnecting Chrome port:', error);
      }
    }

    // Clean up stream provider
    if (this.streamProvider) {
      try {
        // Remove all listeners from the stream provider
        this.streamProvider.removeAllListeners();
        // @ts-expect-error - accessing private property
        if (this.streamProvider._state?.stream) {
          // @ts-expect-error - accessing private property
          this.streamProvider._state.stream.destroy();
        }
        this.streamProvider = undefined;
      } catch (error) {
        this.logger?.error('[ExtensionProvider] Error cleaning up stream provider:', error);
      }
    }

    // Reset connection state
    this.isConnected = false;

    // Clear all notification listeners
    this.removeAllNotificationListeners();
  }

  public isConnectedToExtension(): boolean {
    return this.isConnected;
  }

  /**
   * EIP-1193-style request. Under the hood we choose the "transport"
   */
  public async request(params: MethodParams): Promise<unknown> {
    if (!this.isConnected) {
      throw new Error('[ExtensionProvider] Not connected');
    }

    switch (this.preferredProvider) {
      case ProviderType.EIP1193_PROVIDER:
        if (!this.existingProvider) {
          throw new Error('Existing provider requested but none available');
        }
        return this.existingProvider.request(params as RequestArguments);

      case ProviderType.STREAM_PROVIDER:
        if (!this.streamProvider) {
          throw new Error('Stream provider requested but not initialized');
        }
        return this.streamProvider.request(params as RequestArguments);

      case ProviderType.CHROME_EXTENSION:
        if (!this.chromePort) {
          throw new Error('Chrome extension requested but not connected');
        }
        return this.requestViaChrome(params);

      default:
        // Use whatever provider is available
        if (this.existingProvider) {
          return this.existingProvider.request(params as RequestArguments);
        }
        if (this.streamProvider) {
          return this.streamProvider.request(params as RequestArguments);
        }
        if (this.chromePort) {
          return this.requestViaChrome(params);
        }
        throw new Error('No valid provider available');
    }
  }

  /**
   * Add a callback that fires whenever we receive a 'notification'
   * (a message without an id) from the extension or fallback.
   */
  public onNotification(callback: (data: unknown) => void): void {
    this.logger?.debug('[ExtensionProvider] Adding notification listener');
    this.notificationCallbacks.add(callback);
  }

  public removeNotificationListener(callback: (data: unknown) => void): void {
    this.logger?.debug('[ExtensionProvider] Removing notification listener');
    this.notificationCallbacks.delete(callback);
  }

  public removeAllNotificationListeners(): void {
    this.logger?.debug('[ExtensionProvider] Removing all notification listeners');
    this.notificationCallbacks.clear();
  }

  // ============ Private Implementation ============

  private canUseChromeRuntime(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      typeof chrome.runtime.connect === 'function'
    );
  }

  private async connectChrome(extensionId: string): Promise<boolean> {
    try {
      this.logger?.debug('[ExtensionProvider] connecting via chrome...');
      this.chromePort = chrome.runtime.connect(extensionId);

      let isActive = true;
      this.chromePort.onDisconnect.addListener(() => {
        isActive = false;
        this.logger?.error('[ExtensionProvider] chrome runtime disconnected');
        this.chromePort = null;
      });

      // let a tick for onDisconnect
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (!isActive) {
        return false;
      }

      // Listen to messages from the extension
      this.chromePort.onMessage.addListener(this.handleChromeMessage.bind(this));
      // do a test message if needed
      this.chromePort.postMessage({ type: 'ping' });

      return true;
    } catch (err) {
      this.logger?.error('[ExtensionProvider] connectChrome error:', err);
      return false;
    }
  }

  private requestViaChrome(params: MethodParams): Promise<unknown> {
    console.log("requestViaChrome", params);

    if (!this.chromePort) {
      throw new Error('[ExtensionProvider] no chromePort');
    }

    const id = Date.now() + Math.random(); // or any unique ID
    const requestPayload = {
      id,
      jsonrpc: '2.0',
      method: params.method,
      params: params.params,
    };

    console.log("requestPayload", requestPayload);

    this.logger?.debug('[ExtensionProvider] sending request to chrome port:', requestPayload);

    return new Promise((resolve, reject) => {
      const handleMessage = (msg: any) => {
        console.log("handleMessage", msg);
        // Check if the message matches our request ID
        if (msg?.data?.id === id) {
          this.chromePort?.onMessage.removeListener(handleMessage);
          // Check for error or result
          if (msg.data.error) {
            reject(new Error(msg.data.error.message));
          } else {
            resolve(msg.data.result);
          }
        } else if (!msg?.data?.id) {
          // This is presumably a notification
          this.logger?.debug('[ExtensionProvider] notification from chrome:', msg.data);
          this.notifyCallbacks(msg.data);
        }
      };

      this.chromePort.onMessage.addListener(handleMessage);

      // Send it
      this.chromePort.postMessage({ type: 'caip-x', data: requestPayload });

      // optional timeout
      setTimeout(() => {
        this.chromePort?.onMessage.removeListener(handleMessage);
        reject(new Error('request timeout'));
      }, 30000);
    });
  }

  /**
   * If we get a message on the chrome port that doesn't have an ID,
   * treat it as a notification or subscription update.
   */
  private handleChromeMessage(msg: any) {
    if (msg?.data?.id) {
      // should be handled in requestViaChrome listener - skipping
      return;
    } else {
      // No id => notification
      this.logger?.debug('[ExtensionProvider] chrome notification:', msg);
      this.notifyCallbacks(msg.data);
    }
  }

  private wrapStreamAsProvider(stream: Duplex) {
    this.logger?.debug('[ExtensionProvider] wrapping stream as provider');
    this.streamProvider = new MetaMaskInpageProvider(stream, {
      maxEventListeners: 100,
      shouldSendMetadata: true,
    });

    // Forward notifications from the stream provider
    this.streamProvider.on('notification', (notif) => {
      this.logger?.debug('[ExtensionProvider] stream notification:', notif);
      this.notifyCallbacks(notif);
    });
  }

  /**
   * Fire our local notification callbacks
   */
  private notifyCallbacks(data: unknown) {
    for (const cb of this.notificationCallbacks) {
      try {
        cb(data);
      } catch (err) {
        this.logger?.error('[ExtensionProvider] Error in notification callback:', err);
      }
    }
  }
}
