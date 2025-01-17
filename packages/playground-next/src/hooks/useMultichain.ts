import {
  CreateSessionParams,
  getStoredSession,
  MetamaskMultichain,
  MultichainEvents,
  SessionData,
  SessionEventData,
} from '@metamask/multichainapi';
import { CaipChainId, Json } from '@metamask/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { performMultichainInit } from '@metamask/multichainapi';

interface UseMultichainParams {
  onSessionChanged?: (event: SessionEventData) => void;
  onNotification?: (notification: unknown) => void;
  defaultExtensionId?: string;
}

interface UseMultichainReturn {
  isConnected: boolean;
  currentSession: SessionData | null;
  extensionId: string;
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
}: UseMultichainParams = {}): UseMultichainReturn => {
  const [multichain, setMultichain] = useState<MetamaskMultichain | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null,
  );
  const [extensionId, setExtensionId] = useState<string>(
    defaultExtensionId ?? '',
  );

  const multichainInitRef = useRef<boolean>(false);

  const init = useCallback(async () => {
    // TODO move effect here
    const instance = await performMultichainInit({
      extensionId: defaultExtensionId,
      onSessionChanged: (event) => {
        console.debug('[useMultichain] Session changed', {
          type: event.type,
          sessionId: event.session?.sessionId,
          storedSession: localStorage.getItem('metamask_multichain_session'),
        });
        setCurrentSession(event.session);
        setIsConnected(!!event.session);
        if (event.session) {
          setExtensionId(defaultExtensionId);
        }
        onSessionChanged?.(event);
      },
      onNotification,
      storageKey: 'metamask_multichain_session', // explicitly set the storage key
    });

    console.debug('[useMultichain] Initialization complete');
    setMultichain(instance);
    // Check initial connection state
    if (instance) {
      console.debug('[useMultichain] Checking initial session', instance);

      const existingSessionId = localStorage.getItem(
        'metamask_multichain_session',
      );
      console.debug('[useMultichain] Existing session ID', {
        existingSessionId,
      });
      const storedSession = getStoredSession('metamask_multichain_session');
      console.debug('[useMultichain] Stored session', storedSession);
      const session = await instance.getSession();

      setIsConnected(!!session);
      setCurrentSession(session);
    }
  }, [defaultExtensionId, onSessionChanged, onNotification]);

  // Initialize multichain instance
  useEffect(() => {
    if (multichainInitRef.current) {
      console.debug('[useMultichain] Already initialized, skipping');
      return;
    }
    console.debug('[useMultichain] Starting initialization', {
      defaultExtensionId,
      storedSession: localStorage.getItem('metamask_multichain_session'),
    });
    multichainInitRef.current = true;
    init();
    return () => {
      console.debug('[useMultichain] Cleanup - disconnecting');
      multichain?.disconnect();
    };
  }, [defaultExtensionId, onSessionChanged, onNotification, multichain, init]);

  const connect = useCallback(
    async (params?: { extensionId: string }) => {
      if (!multichain) {
        console.error(
          '[useMultichain] Connect failed - Multichain not initialized',
        );
        throw new Error('Multichain not initialized');
      }

      const { extensionId } = params ?? { extensionId: defaultExtensionId };
      console.debug('[useMultichain] Connecting', { extensionId });
      const connected = await multichain.connect({ extensionId });
      console.debug('[useMultichain] Connection result', { connected });
      setIsConnected(connected);
      setExtensionId(extensionId);
      return connected;
    },
    [multichain, defaultExtensionId],
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

  const getSession = useCallback(
    async (params?: { sessionId?: string }) => {
      if (!multichain) throw new Error('Multichain not initialized');
      return multichain.getSession(params);
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
