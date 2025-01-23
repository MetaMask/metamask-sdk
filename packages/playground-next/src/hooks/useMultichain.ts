import { eip6963RequestProvider } from '@metamask/sdk';
import {
  CreateSessionParams,
  getStoredSession,
  MetamaskMultichain,
  MultichainEvents,
  performMultichainInit,
  SessionData,
  SessionEventData,
} from '@metamask/sdk-multichain';
import { CaipChainId, Json } from '@metamask/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMultichainParams {
  onSessionChanged?: (event: SessionEventData) => void;
  onNotification?: (notification: unknown) => void;
  defaultExtensionId?: string;
  useExistingProvider?: boolean;
}

interface UseMultichainReturn {
  isConnected: boolean;
  currentSession: SessionData | null;
  extensionId: string;
  error: string | null;
  isInitializing: boolean;
  connect: (params: { extensionId: string }) => Promise<boolean>;
  disconnect: () => void;
  createSession: (params: CreateSessionParams) => Promise<SessionData>;
  getSession: (params?: { sessionId?: string }) => Promise<SessionData | null>;
  revokeSession: (params?: { sessionId?: string }) => Promise<boolean>;
  invokeMethod: (params: {
    scope: CaipChainId;
    request: { method: string; params: Json[] };
  }) => Promise<Json>;
  addListener: <K extends keyof MultichainEvents>(
    event: K,
    listener: MultichainEvents[K],
  ) => void;
  removeListener: <K extends keyof MultichainEvents>(
    event: K,
    listener: MultichainEvents[K],
  ) => void;
}

// React hook implementation
export const useMultichain = ({
  onSessionChanged,
  onNotification,
  defaultExtensionId = 'nfdjnfhlblppdgdplngdjgpifllaamoc',
  useExistingProvider = false,
}: UseMultichainParams = {}): UseMultichainReturn => {
  const [multichain, setMultichain] = useState<MetamaskMultichain | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null,
  );
  const [extensionId, setExtensionId] = useState<string>(
    defaultExtensionId ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const multichainInitRef = useRef<boolean>(false);
  const prevProviderTypeRef = useRef(useExistingProvider);

  const init = useCallback(async () => {
    try {
      console.debug('[useMultichain] Starting initialization', {
        defaultExtensionId,
        useExistingProvider,
        storedSession: localStorage.getItem('metamask_multichain_session'),
      });

      let existingProvider;
      if (useExistingProvider) {
        try {
          existingProvider = await eip6963RequestProvider({
            rdns: 'io.metamask.flask',
          });
          console.debug(
            '[useMultichain] Found existing provider:',
            existingProvider,
          );
        } catch (err) {
          console.warn('[useMultichain] Failed to get existing provider:', err);
        }
      }

      const instance = await performMultichainInit({
        extensionId: defaultExtensionId,
        onSessionChanged,
        onNotification,
        storageKey: 'metamask_multichain_session',
        providerConfig: existingProvider
          ? {
              existingProvider,
            }
          : undefined,
      });

      console.log(`[useMultichain] Multichain instance`, instance);

      setMultichain(instance);

      // Only try to get session if we have a stored session
      const storedSession = getStoredSession('metamask_multichain_session');
      if (storedSession) {
        try {
          // First try to connect using stored extension ID
          const connected = await instance.connect({
            extensionId: storedSession.extensionId,
          });

          if (connected) {
            const session = await instance.getSession();
            if (session) {
              setIsConnected(true);
              setCurrentSession(session);
              setExtensionId(storedSession.extensionId);
            } else {
              throw new Error('No valid session found');
            }
          } else {
            throw new Error('Failed to connect to stored extension');
          }
        } catch (sessionError) {
          console.debug(
            '[useMultichain] Failed to restore session:',
            sessionError,
          );
          // Clear stored session if it's invalid
          localStorage.removeItem('metamask_multichain_session');
          setIsConnected(false);
          setCurrentSession(null);
          // Don't set error here as this is an expected case
        }
      }

      setError(null);
    } catch (error) {
      console.error('[useMultichain] Initialization failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize');
      setIsConnected(false);
      setCurrentSession(null);
    } finally {
      setIsInitializing(false);
    }
  }, [
    defaultExtensionId,
    onSessionChanged,
    onNotification,
    useExistingProvider,
  ]);

  // Initialize multichain instance
  useEffect(() => {
    // Allow first init or reinitialize if provider type changed
    if (
      multichainInitRef.current &&
      prevProviderTypeRef.current === useExistingProvider
    ) {
      return;
    }

    console.debug('[useMultichain] Starting initialization', {
      defaultExtensionId,
      useExistingProvider,
      storedSession: localStorage.getItem('metamask_multichain_session'),
    });

    prevProviderTypeRef.current = useExistingProvider;
    multichainInitRef.current = true;

    init();

    return () => {
      console.debug('[useMultichain] Cleanup - disconnecting');
      multichain?.disconnect();
    };
  }, [
    defaultExtensionId,
    onSessionChanged,
    onNotification,
    init,
    useExistingProvider,
    multichain,
  ]);

  const connect = useCallback(
    async (params?: { extensionId: string }) => {
      if (!multichain) {
        throw new Error('Multichain not initialized. Please try again.');
      }

      try {
        setError(null);
        const { extensionId: connExtensionId } = params ?? {
          extensionId: defaultExtensionId,
        };
        console.debug('[useMultichain] Connecting', {
          extensionId: connExtensionId,
        });

        const connected = await multichain.connect({
          extensionId: connExtensionId,
        });

        if (!connected) {
          throw new Error(
            'Failed to connect to MetaMask. Please make sure it is installed and unlocked.',
          );
        }

        console.debug('[useMultichain] Connection result', { connected });
        setIsConnected(connected);
        setExtensionId(connExtensionId);

        // Try to get or create session after successful connection
        try {
          const session = await multichain.getSession();
          if (session) {
            setCurrentSession(session);
          }
        } catch (sessionError) {
          console.debug(
            '[useMultichain] No existing session found after connect',
            sessionError,
          );
          // This is normal for first-time connections, don't throw
        }

        return connected;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to connect';
        console.error('[useMultichain] Connection error:', errorMessage);
        setIsConnected(false);
        setError(errorMessage);
        throw error;
      }
    },
    [multichain, defaultExtensionId],
  );

  const getSession = useCallback(
    async (params?: { sessionId?: string }) => {
      if (!multichain) {
        throw new Error('Multichain not initialized');
      }
      if (!isConnected) {
        throw new Error('Provider not connected. Please connect first.');
      }
      return multichain.getSession(params);
    },
    [multichain, isConnected],
  );

  const disconnect = useCallback(() => {
    if (!multichain) {
      console.debug(
        '[useMultichain] Disconnect called but multichain not initialized',
      );
      return;
    }
    console.debug('[useMultichain] Disconnecting');
    multichain.disconnect();
    setIsConnected(false);
    setCurrentSession(null);
    setExtensionId('');
  }, [multichain]);

  const createSession = useCallback(
    async (params: CreateSessionParams) => {
      if (!multichain) throw new Error('Multichain not initialized');
      console.debug('[useMultichain] Creating new session', { params });
      const session = await multichain.createSession(params);
      console.debug('[useMultichain] Session created', {
        sessionId: session.sessionId,
        storedSession: localStorage.getItem('metamask_multichain_session'),
      });
      setCurrentSession(session);
      setIsConnected(true);
      return session;
    },
    [multichain],
  );

  const revokeSession = useCallback(
    async (params?: { sessionId?: string }) => {
      if (!multichain) throw new Error('Multichain not initialized');
      const result = await multichain.revokeSession(params);
      if (result) {
        setCurrentSession(null);
      }
      return result;
    },
    [multichain],
  );

  const invokeMethod = useCallback(
    async (params: {
      scope: CaipChainId;
      request: { method: string; params: Json[] };
    }) => {
      if (!multichain) throw new Error('Multichain not initialized');
      return multichain.invokeMethod(params);
    },
    [multichain],
  );

  const addListener = useCallback(
    <K extends keyof MultichainEvents>(
      event: K,
      listener: MultichainEvents[K],
    ) => {
      if (!multichain) throw new Error('Multichain not initialized');
      multichain.addListener(event, listener);
    },
    [multichain],
  );

  const removeListener = useCallback(
    <K extends keyof MultichainEvents>(
      event: K,
      listener: MultichainEvents[K],
    ) => {
      if (!multichain) throw new Error('Multichain not initialized');
      multichain.removeListener(event, listener);
    },
    [multichain],
  );

  return {
    isConnected,
    currentSession,
    extensionId,
    error,
    isInitializing,
    connect,
    disconnect,
    createSession,
    getSession,
    revokeSession,
    invokeMethod,
    addListener,
    removeListener,
  };
};
