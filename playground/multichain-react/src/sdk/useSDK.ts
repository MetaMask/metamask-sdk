/* eslint-disable */

import { createMetamaskSDK, type InvokeMethodOptions, type MultichainCore, type Scope, type SessionData } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import { useCallback, useEffect, useState } from 'react';
export const METAMASK_PROD_CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

type SDKOptions = {
	onSessionChanged?: (session: SessionData | undefined) => void;
	extensionId?: string;
};

export function useSDK({ extensionId }: SDKOptions) {
	const [sdk, setSdk] = useState<MultichainCore>();
	const [currentExtensionId, setCurrentExtensionId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentSession, setCurrentSession] = useState<SessionData | undefined>(undefined);

	const initializeSDK = useCallback(async (extensionId?: string) => {
		try {
			const newSdk = await createMetamaskSDK({
				dapp: {
					name: 'playground',
					url: 'https://playground.metamask.io',
				},
				analytics: {
					enabled: false,
				},
				ui: {
					headless: false,
				},
				...(extensionId && {
					transport: {
						extensionId: extensionId,
					},
				}),
			});

			// Set up event listener immediately after SDK creation
			const unsubscribe = newSdk.on('session_changed', (session) => {
				setCurrentSession(session);
			});

			// Initialize the SDK if it's still pending
			if (newSdk.state === 'pending') {
				await newSdk.init();
			}

			setSdk(newSdk);
			return unsubscribe;
		} catch (error: any) {
			setError(error.message);
			return undefined;
		}
	}, []);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		if (extensionId && currentExtensionId !== extensionId) {
			setCurrentExtensionId(extensionId);
			// Reinitialize SDK with new extension ID
			initializeSDK(extensionId).then((unsub) => {
				unsubscribe = unsub;
			});
		} else if (!sdk) {
			// Initialize SDK for the first time
			initializeSDK(extensionId).then((unsub) => {
				unsubscribe = unsub;
			});
		}

		return () => {
			unsubscribe?.();
		};
	}, [sdk, extensionId, currentExtensionId, initializeSDK]);

	const disconnect = useCallback(async () => {
		await sdk?.disconnect();
	}, [sdk]);

	const connect = useCallback(
		async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
			await sdk?.connect(scopes, caipAccountIds);
		},
		[sdk],
	);

	const invokeMethod = useCallback(
		async (options: InvokeMethodOptions) => {
			return sdk?.invokeMethod(options);
		},
		[sdk],
	);

	return {
		isConnected: currentSession !== undefined,
		session: currentSession,
		error,
		connect,
		disconnect,
		invokeMethod,
		storage: sdk?.storage,
	};
}
