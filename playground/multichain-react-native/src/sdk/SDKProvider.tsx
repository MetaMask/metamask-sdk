/* eslint-disable */

import { createMetamaskSDK, type SDKState, type InvokeMethodOptions, type Scope, type SessionData, type MultichainCore } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { METAMASK_PROD_CHROME_ID } from '../constants';
import { Linking } from 'react-native';

const SDKContext = createContext<
	| {
			session: SessionData | undefined;
			state: SDKState;
			error: Error | null;
			connect: (scopes: Scope[], caipAccountIds: CaipAccountId[]) => Promise<void>;
			disconnect: () => Promise<void>;
			invokeMethod: (options: InvokeMethodOptions) => Promise<any>;
	  }
	| undefined
>(undefined);

export const SDKProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<SDKState>('pending');
	const [session, setSession] = useState<SessionData | undefined>(undefined);
	const [error, setError] = useState<Error | null>(null);

	const sdkRef = useRef<Promise<MultichainCore>>(undefined);

	useEffect(() => {
		if (!sdkRef.current) {
			sdkRef.current = createMetamaskSDK({
				dapp: {
					name: 'playground',
					url: 'https://playground.metamask.io',
				},
				analytics: {
					enabled: false,
				},
				transport: {
					extensionId: METAMASK_PROD_CHROME_ID,
					onNotification: (notification: unknown) => {
						const payload = notification as Record<string, unknown>;
						if (payload.method === 'wallet_sessionChanged' || payload.method === 'wallet_createSession' || payload.method === 'wallet_getSession') {
							setSession(payload.params as SessionData);
						} else if (payload.method === 'stateChanged') {
							setState(payload.params as SDKState);
						}
					},
				},
			});
		}
	}, []);

	const disconnect = useCallback(async () => {
		try {
			if (!sdkRef.current) {
				throw new Error('SDK not initialized');
			}
			const sdkInstance = await sdkRef.current;
			return sdkInstance.disconnect();
		} catch (error) {
			setError(error as Error);
		}
	}, [sdkRef.current]);

	const connect = useCallback(
		async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
			try {
				if (!sdkRef.current) {
					throw new Error('SDK not initialized');
				}
				const sdkInstance = await sdkRef.current;
				await sdkInstance.connect(scopes, caipAccountIds);
			} catch (error) {
			setError(error as Error);
			}
		},
		[sdkRef.current],
	);

	const invokeMethod = useCallback(
		async (options: InvokeMethodOptions) => {
			try {
				if (!sdkRef.current) {
					throw new Error('SDK not initialized');
				}
				const sdkInstance = await sdkRef.current;
				return sdkInstance.invokeMethod(options);
			} catch (error) {
			setError(error as Error);
			}
		},
		[sdkRef.current],
	);

	return (
		<SDKContext.Provider
			value={{
				session,
				state,
				error,
				connect,
				disconnect,
				invokeMethod,
			}}
		>
			{children}
		</SDKContext.Provider>
	);
};

export const useSDK = () => {
	const context = useContext(SDKContext);
	if (context === undefined) {
		throw new Error('useSDK must be used within a SDKProvider');
	}
	return context;
};

