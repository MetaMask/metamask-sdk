import {
  CreateSessionParams,
  MetamaskMultichain,
  MultichainEvents,
  SessionData,
  SessionEventData,
} from '@metamask/multichainapi';
import { CaipChainId, Json } from '@metamask/utils';
import { useCallback, useEffect, useState } from 'react';
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
  getSession: (params: { sessionId?: string }) => Promise<SessionData | null>;
  revokeSession: (params: { sessionId?: string }) => Promise<boolean>;
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
  defaultExtensionId,
}: UseMultichainParams = {}): UseMultichainReturn => {
  const [multichain, setMultichain] = useState<MetamaskMultichain | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null,
  );
  const [extensionId, setExtensionId] = useState<string>(
    defaultExtensionId ?? '',
  );

  // Initialize multichain instance
  useEffect(() => {
    performMultichainInit({
      extensionId: defaultExtensionId,
      onSessionChanged: (event) => {
        setCurrentSession(event.session);
        onSessionChanged?.(event);
      },
      onNotification,
    }).then((instance) => {
      setMultichain(instance);
      // Check initial connection state
      if (instance) {
        instance.getSession({}).then((session) => {
          setIsConnected(!!session);
          setCurrentSession(session);
        });
      }
    });

    return () => {
      multichain?.disconnect();
    };
  }, [defaultExtensionId, onSessionChanged, onNotification, multichain]);

  const connect = useCallback(
    async ({ extensionId }: { extensionId: string }) => {
      if (!multichain) throw new Error('Multichain not initialized');

      const connected = await multichain.connect({ extensionId });
      setIsConnected(connected);
      setExtensionId(extensionId);
      return connected;
    },
    [multichain],
  );

  const disconnect = useCallback(() => {
    if (!multichain) return;
    multichain.disconnect();
    setIsConnected(false);
    setCurrentSession(null);
    setExtensionId('');
  }, [multichain]);

  const createSession = useCallback(
    async (params: CreateSessionParams) => {
      if (!multichain) throw new Error('Multichain not initialized');
      const session = await multichain.createSession(params);
      setCurrentSession(session);
      return session;
    },
    [multichain],
  );

  const getSession = useCallback(
    async (params: { sessionId?: string }) => {
      if (!multichain) throw new Error('Multichain not initialized');
      return multichain.getSession(params);
    },
    [multichain],
  );

  const revokeSession = useCallback(
    async (params: { sessionId?: string }) => {
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
