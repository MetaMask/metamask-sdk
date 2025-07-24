/* eslint-disable */

import {
	createMetamaskSDK,
	type InvokeMethodOptions,
	type MultichainCore,
	type Scope,
	type SessionData,
} from "@metamask/multichain-sdk";
import type { CaipAccountId } from "@metamask/utils";
import { useCallback, useEffect, useState } from "react";
export const METAMASK_PROD_CHROME_ID = "nkbihfbeogaeaoehlefnkodbefgpgknn";

type SDKOptions = {
	onSessionChanged?: (session: SessionData | undefined) => void;
	extensionId?: string;
};

async function initialize(extensionId?: string) {
	const sdk = await createMetamaskSDK({
		dapp: {
			name: "playground",
			url: "https://playground.metamask.io",
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
	return sdk;
}

export function useSDK({ extensionId }: SDKOptions) {
	const [sdk, setSdk] = useState<MultichainCore>();
	const [currentExtensionId, setCurrentExtensionId] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [currentSession, setCurrentSession] = useState<SessionData | undefined>(
		undefined,
	);

	useEffect(() => {
		let unsubscribe1: () => void;
		if (sdk) {
			unsubscribe1 = sdk.on("session_changed", (session) => {
				setCurrentSession(session);
			});
			if (sdk.state === "pending") {
				sdk.init();
			}
		}
		return () => {
			unsubscribe1?.();
		};
	}, [sdk, setCurrentSession]);

	useEffect(() => {
		if (extensionId && currentExtensionId !== extensionId) {
			setCurrentExtensionId(extensionId);
			// Reinitialize SDK with new extension ID
			initialize(extensionId)
				.then((newSdk) => {
					setSdk(newSdk);
				})
				.catch((error) => {
					setError(error.message);
				});
		} else if (!sdk) {
			// Initialize SDK for the first time
			initialize(extensionId)
				.then((sdk) => {
					setSdk(sdk);
				})
				.catch((error) => {
					setError(error.message);
				});
		}
	}, [sdk, extensionId, currentExtensionId, setSdk, setCurrentExtensionId]);

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
