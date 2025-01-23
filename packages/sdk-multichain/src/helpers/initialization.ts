import { MetaMaskInpageProvider } from '@metamask/providers';
import { MetamaskMultichain } from '../MetamaskMultichain';
import { LoggerLike, SessionData, SessionEventData, StoredSession } from '../types';
import { discoverWallets, walletFilters } from './walletDiscovery';

import { Duplex } from 'readable-stream';

export interface InitializationParams {
  extensionId?: string;
  onSessionChanged?: (event: SessionEventData) => void;
  onNotification?: (notification: unknown) => void;
  storageKey?: string;
  logger?: LoggerLike;
  providerConfig?: {
    existingProvider?: MetaMaskInpageProvider;
    existingStream?: Duplex;
  };
}

/**
 * Checks if the stored session is still valid
 */
const isValidStoredSession = (session: StoredSession): boolean => {
  if (!session.expiry) {
    return true;
  }
  const expiryDate = new Date(session.expiry);
  return expiryDate > new Date();
};

/**
 * Detects if we're in a Chrome-like environment with extension support
 */
const isChromeRuntime = (): boolean => {
  return typeof chrome !== 'undefined'
    && chrome.runtime
    && typeof chrome.runtime.connect === 'function';
};

/**
 * Automatically detects MetaMask extension ID if available
 */
const detectMetaMaskExtensionId = async (): Promise<string | undefined> => {
  try {
    const wallets = await discoverWallets({
      timeout: 1000,
      filterPredicate: walletFilters.isMetaMask,
    });

    return wallets[0]?.providerId;
  } catch (error) {
    console.error('Failed to detect MetaMask extension:', error);
    return undefined;
  }
};

/**
 * Gets stored session data from storage
 */
const getStoredSession = (storageKey: string): StoredSession | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as StoredSession;
  } catch (error) {
    console.error('Failed to parse stored session:', error);
    return null;
  }
};

/**
 * Stores session data in storage
 */
const storeSession = (
  storageKey: string,
  sessionData: SessionData,
  extensionId: string,
): void => {
  try {
    const dataToStore: StoredSession = {
      sessionId: sessionData.sessionId,
      extensionId,
      expiry: sessionData.expiry,
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
};

/**
 * Platform-agnostic initialization of MetaMask Multichain
 */
export const performMultichainInit = async ({
  extensionId,
  onSessionChanged,
  onNotification,
  logger,
  storageKey = 'metamask_multichain_session',
  providerConfig,
}: InitializationParams = {}): Promise<MetamaskMultichain> => {
  console.debug('[performMultichainInit] Starting initialization with:', {
    extensionId,
    hasProviderConfig: !!providerConfig,
    hasExistingProvider: !!providerConfig?.existingProvider,
    storageKey,
  });

  const multichain = new MetamaskMultichain({
    logger,
    existingProvider: providerConfig?.existingProvider,
    existingStream: providerConfig?.existingStream,
  });

  // Set up event listeners
  if (onSessionChanged) {
    multichain.addListener('sessionChanged', (event) => {
      // Update stored session when changed
      if (event.type === 'created') {
        storeSession(storageKey, event.session, extensionId || '');
      } else if (event.type === 'revoked') {
        localStorage.removeItem(storageKey);
      }
      onSessionChanged(event);
    });
  }

  if (onNotification) {
    multichain.addListener('notification', onNotification);
  }

  // Try to restore previous session or auto-connect
  try {
    // If we have an existing provider, try to use it first
    if (providerConfig?.existingProvider) {
      logger?.debug('[performMultichainInit] Using existing provider');
      return multichain;
    }

    // Check for stored session
    const storedSession = getStoredSession(storageKey);
    if (storedSession && isValidStoredSession(storedSession)) {
      logger?.debug('[performMultichainInit] Found valid stored session:', storedSession);
      const connected = await multichain.connect({
        extensionId: storedSession.extensionId
      });
      if (connected) {
        const session = await multichain.getSession({
          sessionId: storedSession.sessionId
        });
        if (session) {
          logger?.debug('[performMultichainInit] Successfully restored session');
          return multichain;
        }
      }
    }

    // If no stored session or it failed, try auto-detection
    if (isChromeRuntime() && !providerConfig?.existingProvider) {
      logger?.debug('[performMultichainInit] Attempting auto-detection');
      const detectedExtensionId = extensionId || await detectMetaMaskExtensionId();
      if (detectedExtensionId) {
        await multichain.connect({ extensionId: detectedExtensionId });
      }
    }
  } catch (error) {
    console.error('[performMultichainInit] Failed to initialize:', error);
  }

  return multichain;
};
