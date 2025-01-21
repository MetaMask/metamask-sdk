// packages/sdk-multichain/src/providers/ExtensionProvider.ts

/// <reference types="chrome"/>
import type { Duplex } from 'readable-stream';
import { MetaMaskInpageProvider, RequestArguments } from '@metamask/providers';
import type { LoggerLike, MethodParams, Provider } from '../types';

/**
 * Configuration object for ExtensionProvider
 */
interface ExtensionProviderConfig {
  logger?: LoggerLike;
  /**
   * A user-provided Duplex stream, e.g. from getPostMessageStream or
   * a network socket for mobile. If provided, we skip or fallback to it
   * if chrome.connect is unavailable.
   */
  existingStream?: Duplex;

  /**
   * If you already have a provider object (some EIP-1193 instance)
   * you want to reuse, you can pass it here. This overrides all other
   * connection attempts.
   */
  existingProvider?: MetaMaskInpageProvider;
}

/**
 * ConnectParams might hold your extensionId for the chrome externally_connectable approach
 */
interface ConnectParams {
  extensionId?: string;
}

export class ExtensionProvider implements Provider {
  private logger?: LoggerLike;
  private existingStream?: Duplex;
  private existingProvider?: MetaMaskInpageProvider;

  private isConnected = false;
  private chromePort: chrome.runtime.Port | null = null;
  private fallbackInpageProvider?: MetaMaskInpageProvider;

  /**
   * Storing notification callbacks.
   * If we detect a "notification" (a message without an id) coming from
   * the extension or fallback, we'll call each callback in here.
   */
  private notificationCallbacks: Set<(data: unknown) => void> = new Set();

  constructor(config?: ExtensionProviderConfig) {
    this.logger = config?.logger ?? console;
    this.existingStream = config?.existingStream;
    this.existingProvider = config?.existingProvider;
  }

  /**
   * Attempts to connect. If extensionId is provided and environment supports
   * chrome.runtime, tries that first. Otherwise uses existing provider, etc.
   */
  public async connect(params?: ConnectParams): Promise<boolean> {
    this.logger?.debug('[ExtensionProvider] connect called', params);

    // 1. If extensionId is provided and we can do chrome connect, do that first
    if (params?.extensionId && this.canUseChromeRuntime()) {
      const success = await this.connectChrome(params.extensionId);
      if (success) {
        this.isConnected = true;
        return true;
      }
      this.logger?.debug('[ExtensionProvider] Chrome connect failed, fallback...');
    }

    // 2. If user gave an existingProvider, we’re effectively already connected
    if (this.existingProvider) {
      this.logger?.debug('[ExtensionProvider] Using existingProvider');
      this.isConnected = true;
      return true;
    }

    // 3. If user gave an existingStream, wrap it
    if (this.existingStream) {
      this.logger?.debug('[ExtensionProvider] Using existingStream');
      this.wrapStreamAsProvider(this.existingStream);
      this.isConnected = true;
      return true;
    }

    // 4. Otherwise, fallback to your postMessage or error
    this.logger?.debug('[ExtensionProvider] Attempting postMessage fallback...');
    await this.setupPostMessageFallback();
    this.isConnected = true;
    return true;
  }

  public disconnect() {
    this.logger?.debug('[ExtensionProvider] disconnecting...');
    if (this.chromePort) {
      this.chromePort.disconnect();
      this.chromePort = null;
    }
    // Clean up fallback or existing providers if needed
    this.isConnected = false;
    // Clear any stored notification callbacks
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

    // 1. If we connected via chromePort
    if (this.chromePort) {
      return this.requestViaChrome(params);
    }

    // 2. If we have an existing provider
    if (this.existingProvider) {
      // cast to @metamask/providers' RequestArguments
      return this.existingProvider.request(params as RequestArguments);
    }

    // 3. If we created a fallbackInpageProvider
    if (this.fallbackInpageProvider) {
      return this.fallbackInpageProvider.request(params as RequestArguments);
    }

    throw new Error('[ExtensionProvider] No valid provider found');
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

    this.logger?.debug('[ExtensionProvider] sending request to chrome port:', requestPayload);

    return new Promise((resolve, reject) => {
      const handleMessage = (msg: any) => {
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
      // It's a response to some request
      // You could handle it in requestViaChrome if you store a request map
    } else {
      // No id => notification
      this.logger?.debug('[ExtensionProvider] chrome notification:', msg);
      this.notifyCallbacks(msg.data);
    }
  }

  /**
   * The fallback approach uses postMessage or your existing fallback logic:
   */
  private async setupPostMessageFallback() {
    const fallbackStream = this.createPostMessageStream();
    this.wrapStreamAsProvider(fallbackStream);

    // We can listen for notifications from the inpage provider if needed:
    // (this.fallbackInpageProvider as any).on('data', (msg: any) => {...})
    // or 'notification' event from MetaMaskInpageProvider
    // Or we do nothing if your fallback approach just returns responses
  }

  /**
   * Create or retrieve your existing postMessage stream from the SDK
   */
  private createPostMessageStream(): Duplex {
    throw new Error('Implement your fallback postMessage logic here');
  }

  private wrapStreamAsProvider(stream: Duplex) {
    this.logger?.debug('[ExtensionProvider] wrapping existingStream as inpage provider');
    const provider = new MetaMaskInpageProvider(stream, {
      maxEventListeners: 100,
      shouldSendMetadata: true,
    });
    this.fallbackInpageProvider = provider;

    // Example: if you want to forward notifications from the provider:
    provider.on('notification', (notif) => {
      this.logger?.debug('[ExtensionProvider] fallback notification:', notif);
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
