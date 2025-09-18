/* eslint-disable */

import {
  createMetamaskSDK,
  type InvokeMethodOptions,
  type MultichainCore,
  type Scope,
  type SessionData,
} from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

export const METAMASK_PROD_CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

type SDKOptions = {
  onSessionChanged?: (session: SessionData | undefined) => void;
  extensionId?: string;
};

export function useSDK({ extensionId, onSessionChanged }: SDKOptions) {
  const [sdk, setSdk] = useState<MultichainCore | null>(null);
  const [session, setSession] = useState<SessionData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to hold the onSessionChanged callback.
  // This allows the callback to be updated without re-triggering the main effect.
  const onSessionChangedRef = useRef(onSessionChanged);
  useEffect(() => {
    onSessionChangedRef.current = onSessionChanged;
  }, [onSessionChanged]);

  useEffect(() => {
    let isCancelled = false;
    let sdkInstance: MultichainCore | null = null;
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      // Reset state on re-initialization
      setSdk(null);
      setSession(undefined);
      setError(null);

      try {
        sdkInstance = await createMetamaskSDK({
          dapp: {
            name: 'playground',
            url: 'https://playground.metamask.io',
          },
          analytics: {
            enabled: false,
          },
          ...(extensionId && {
            transport: {
              extensionId: extensionId,
            },
          }),
        });

        if (isCancelled) {
          await sdkInstance.disconnect();
          return;
        }

        unsubscribe = sdkInstance.on('session_changed', (newSession) => {
          setSession(newSession);
          onSessionChangedRef.current?.(newSession);
        });

        const currentSession = await sdkInstance.getCurrentSession();
        if (currentSession && !isCancelled) {
          setSession(currentSession);
          onSessionChangedRef.current?.(currentSession);
        }

        setSdk(sdkInstance);
      } catch (e: any) {
        if (!isCancelled) {
          setError(e.message);
        }
      }
    };

    initialize();

    return () => {
      isCancelled = true;
      unsubscribe?.();
      if (sdkInstance) {
        sdkInstance.disconnect();
      }
    };
  }, [extensionId]);

  const disconnect = useCallback(async () => {
    if (!sdk) {
      throw new Error('SDK not initialized');
    }
    await sdk.disconnect();
  }, [sdk]);

  const connect = useCallback(
    async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }
      return sdk.connect(scopes, caipAccountIds);
    },
    [sdk],
  );

  const invokeMethod = useCallback(
    async (options: InvokeMethodOptions) => {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }
      return sdk.invokeMethod(options);
    },
    [sdk],
  );

  return {
    isConnected: session !== undefined,
    session,
    error,
    connect,
    disconnect,
    invokeMethod,
  };
}
