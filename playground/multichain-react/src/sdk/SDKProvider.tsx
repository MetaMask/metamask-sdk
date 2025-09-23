/* eslint-disable */

import { createMetamaskSDK, type InvokeMethodOptions, type MultichainCore, type Scope, type SessionData } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { METAMASK_PROD_CHROME_ID } from '../constants';

type SDKContextType = {
  sdk: MultichainCore | null;
  session: SessionData | undefined;
  isConnected: boolean;
  error: string | null;
  connect: (scopes: Scope[], caipAccountIds: CaipAccountId[]) => Promise<void>;
  disconnect: () => Promise<void>;
  invokeMethod: (options: InvokeMethodOptions) => Promise<any>;
};

const SDKContext = createContext<SDKContextType | undefined>(undefined);

export const SDKProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionData | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const sdk = useRef<MultichainCore | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const sdkInstance = await createMetamaskSDK({
          dapp: {
            name: 'playground',
            url: 'https://playground.metamask.io',
          },
          analytics: {
            enabled: false,
          },
          transport: {
            extensionId: METAMASK_PROD_CHROME_ID,
            onResumeSession: (resumedSession: SessionData) => {
              console.log('session resumed', resumedSession);
              setSession(resumedSession);
            },
          },
        });
        sdk.current = sdkInstance;

        // Subscribe to session changes
        sdk.current.on('wallet_sessionChanged', (newSession) => {
          setSession(newSession);
        });

      } catch (e: any) {
        setError(e.message);
      } finally {
        isLoadingRef.current = false;
      }
    }

    if (!isLoadingRef.current && !sdk.current) {
      isLoadingRef.current = true;
      load();
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!sdk.current) {
      throw new Error('SDK not initialized');
    }
    await sdk.current.disconnect();
    setSession(undefined);
  }, []);

  const connect = useCallback(
    async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
      if (!sdk.current) {
        throw new Error('SDK not initialized');
      }
      try {
        await sdk.current.connect(scopes, caipAccountIds);
        const newSession = await sdk.current.getCurrentSession();
        setSession(newSession);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [],
  );

  const invokeMethod = useCallback(
    async (options: InvokeMethodOptions) => {
      if (!sdk.current) {
        throw new Error('SDK not initialized');
      }
      return sdk.current.invokeMethod(options);
    },
    [],
  );

  const value = {
    sdk: sdk.current,
    session,
    isConnected: session !== undefined,
    error,
    connect,
    disconnect,
    invokeMethod,
  };

  return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};

export const useSDK = (): SDKContextType => {
  const context = useContext(SDKContext);
  if (context === undefined) {
    throw new Error('useSDK must be used within a SDKProvider');
  }
  return context;
};
