/* eslint-disable */

import { createMetamaskSDK, type SDKState, type InvokeMethodOptions, type Scope, type SessionData } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { METAMASK_PROD_CHROME_ID } from '../constants';

const SDKContext = createContext<
	| {
			session: SessionData | undefined;
			state: SDKState;
			error: string | null;
			connect: (scopes: Scope[], caipAccountIds: CaipAccountId[]) => Promise<void>;
			disconnect: () => Promise<void>;
			invokeMethod: (options: InvokeMethodOptions) => Promise<any>;
	  }
	| undefined
>(undefined);

export const SDKProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<SDKState>('pending');
	const [session, setSession] = useState<SessionData | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	const sdk = useMemo(() => {
		setState('pending');
		const response = createMetamaskSDK({
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
		response.then((sdk) => {
			setState(sdk.state);
			sdk.on('wallet_sessionChanged', (newSession) => {
				setSession(newSession);
			});
		});
		return response;
	}, []);

	const disconnect = useCallback(async () => {
		const sdkInstance = await sdk;
		setState(sdkInstance.state);
		return sdkInstance.disconnect();
	}, []);

	const connect = useCallback(async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
		const sdkInstance = await sdk;
		setState(sdkInstance.state);
		await sdkInstance.connect(scopes, caipAccountIds);
		setState(sdkInstance.state);
		const newSession = await sdkInstance.getCurrentSession();
		setSession(newSession);
	}, []);

	const invokeMethod = useCallback(async (options: InvokeMethodOptions) => {
		const sdkInstance = await sdk;
		setState(sdkInstance.state);
		return sdkInstance.invokeMethod(options);
	}, []);

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
