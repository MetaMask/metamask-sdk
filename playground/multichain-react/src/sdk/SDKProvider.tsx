/* eslint-disable */

import { createMetamaskSDK, type SDKState, type InvokeMethodOptions, type Scope, type SessionData, type MultichainCore } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { METAMASK_PROD_CHROME_ID } from '../constants';

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

let sdk: MultichainCore | null = null;

export const SDKProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<SDKState>('pending');
	const [session, setSession] = useState<SessionData | undefined>(undefined);
	const [error, setError] = useState<Error | null>(null);

	const sdkPromise = useMemo(async () => {
		if (!sdk) {
			sdk = await createMetamaskSDK({
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
		return sdk;
	}, []);

	const disconnect = useCallback(async () => {
		try {
			const sdkInstance = await sdkPromise;
			return sdkInstance.disconnect();
		} catch (error) {
			setError(error);
		}
	}, [sdkPromise]);

	const connect = useCallback(
		async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
			try {
				const sdkInstance = await sdkPromise;
				await sdkInstance.connect(scopes, caipAccountIds);
			} catch (error) {
				setError(error);
			}
		},
		[sdkPromise],
	);

	const invokeMethod = useCallback(
		async (options: InvokeMethodOptions) => {
			try {
				const sdkInstance = await sdkPromise;
				return sdkInstance.invokeMethod(options);
			} catch (error) {
				setError(error);
			}
		},
		[sdkPromise],
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
