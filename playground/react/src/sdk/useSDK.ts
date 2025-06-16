/* eslint-disable */

import {
  createMetamaskSDK,
  type Scope,
  type Notification
} from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import { useCallback, useEffect, useState } from 'react';
import type { InvokeMethodOptions, SessionData } from '@metamask/multichain-sdk';

export const METAMASK_PROD_CHROME_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';


type MultichainSDK = Awaited<ReturnType<typeof createMetamaskSDK>>;


type SDKOptions = {
	onSessionChanged: (notification: Notification) => void;
	onWalletNotify: (notification: Notification) => void;
	onWalletAnnounce: (ev: Event) => void;
}

export function useSDK({ onSessionChanged, onWalletNotify, onWalletAnnounce }: SDKOptions) {
	const [sdk, setSdk] = useState<MultichainSDK>();
	const [isConnected, setIsConnected] = useState(false);
	const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
	const [extensionId, setExtensionId] = useState<string>(
		METAMASK_PROD_CHROME_ID, // default to prod chrome extension id
	);
	/**
	 * setup caip294:wallet_announce event listener
	 * docs: https://github.com/ChainAgnostic/CAIPs/blob/bc4942857a8e04593ed92f7dc66653577a1c4435/CAIPs/caip-294.md#specification
	 */
	useEffect(() => {
		window.addEventListener("caip294:wallet_announce", onWalletAnnounce);
		window.dispatchEvent(
			new CustomEvent("caip294:wallet_prompt", {
				detail: {
					id: 1,
					jsonrpc: "2.0",
					method: "wallet_prompt",
					params: {},
				},
			}),
		);
		return () => {
			window.removeEventListener("caip294:wallet_announce", onWalletAnnounce);
		};
	}, [onWalletAnnounce]);

	useEffect(() => {
		if (sdk) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const unsubscribe1 = sdk.onNotification((notification:any) => {
				if (notification.method === "wallet_sessionChanged") {
					setCurrentSession(notification.params as SessionData ?? null);
					onSessionChanged(notification);
				}
			});
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const unsubscribe2 = sdk.onNotification((notification: any) => {
				if (notification.method === "wallet_notify") {
					onWalletNotify(notification);
				}
			});

			return () => {
				unsubscribe1();
				unsubscribe2();
			};
		}
	}, [sdk, onWalletNotify, onSessionChanged]);

	// Initialize SDK
	useEffect(() => {
		if (!sdk) {
      createMetamaskSDK({
        dapp: {
          name: "playground",
          url: "https://playground.metamask.io",
        },
        analytics: {
          enabled: false,
        },
        logging: {
          logLevel: "debug",
        },
        ui: {
          headless: true,
        },
        storage: {
          enabled: true,
        },
      }).then(setSdk);
    }
		return () => {
			if (sdk) {
				sdk.revokeSession();
			}
		};
	}, [sdk, sdk?.revokeSession]);

	// Auto-connect with stored extension ID
	useEffect(() => {
		const autoConnect = async () => {
      const storedExtensionId = await sdk?.storage.getExtensionId() ?? null;
      if (storedExtensionId && sdk) {
        try {
					const connectionSuccess = await sdk.connect({extensionId:storedExtensionId});
          setIsConnected(connectionSuccess);
					if (connectionSuccess) {
						setExtensionId(storedExtensionId);
					} else {
						console.error("Error auto-connecting");
					}
				} catch (error) {
					console.error("Error auto-connecting:", error);
					setIsConnected(false);
				}
      }
		};
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		autoConnect();
	}, [sdk]);

	// Check for existing session when connected
	useEffect(() => {
		const checkExistingSession = async () => {
			if (sdk && isConnected) {
				try {
					const result = await sdk.getSession();
					if (result) {
						setCurrentSession(result);
					}
				} catch (error) {
					console.error("Error checking existing session:", error);
				}
			}
		};
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		checkExistingSession();
	}, [sdk, isConnected]);

	const connect = useCallback(
		async (newExtensionId: string) => {
			if (sdk) {
				try {
					const connected = await sdk.connect({extensionId:newExtensionId});
					setIsConnected(connected);
					if (connected) {
						sdk.storage.setExtensionId(newExtensionId);
						setExtensionId(newExtensionId);
					}
				} catch (error) {
					setIsConnected(false);
					throw error;
				}
			}
		},
		[sdk],
	);

	const disconnect = useCallback(() => {
		if (sdk) {
			sdk.disconnect();
			setIsConnected(false);
			setCurrentSession(null);
			sdk.storage.removeExtensionId();
			setExtensionId("");
		}
	}, [sdk]);

	const createSession = useCallback(
		async (scopes: Scope[], caipAccountIds: CaipAccountId[]) => {
			if (!sdk) {
				throw new Error("SDK not initialized");
			}
			const result = await sdk.createSession(scopes, caipAccountIds);
			setCurrentSession(result);
			return result;
		},
		[sdk],
	);

	const getSession = useCallback(async () => {
		if (!sdk) {
			throw new Error("SDK not initialized");
		}
		const result = await sdk.getSession();
		setCurrentSession(result ?? null);
		return result;
	}, [sdk]);

	const revokeSession = useCallback(async () => {
		if (!sdk) {
			throw new Error("SDK not initialized");
		}
		await sdk.revokeSession();
		setCurrentSession(null);
	}, [sdk]);

	const onNotification = useCallback(
		(callback: (notification: unknown) => void) => {
			if (!sdk) {
				throw new Error("SDK not initialized");
			}
			return sdk.onNotification(callback);
		},
		[sdk],
	);

	const invokeMethod = useCallback(
		async (options: InvokeMethodOptions) => {
			if (!sdk) {
				throw new Error("SDK not initialized");
			}
			return sdk.invokeMethod(options);
		},
		[sdk],
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
		onNotification,
		invokeMethod,
    storage: sdk?.storage
	};
}
