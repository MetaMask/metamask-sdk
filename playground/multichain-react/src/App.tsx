import { useState, useEffect, useCallback } from 'react';
import type { Scope, SessionData } from '@metamask/multichain-sdk';
import type { CaipAccountId } from '@metamask/utils';
import { useSDK } from './sdk';
import DynamicInputs, { INPUT_LABEL_TYPE } from './components/DynamicInputs';
import { FEATURED_NETWORKS } from './constants/networks';
import { ScopeCard } from './components/ScopeCard';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

function App() {
	const [customScopes, setCustomScopes] = useState<string[]>(['eip155:1']);
	const [caipAccountIds, setCaipAccountIds] = useState<CaipAccountId[]>([]);
	const { state, session, connect: sdkConnect, disconnect: sdkDisconnect } = useSDK();

	const handleCheckboxChange = useCallback(
		(value: string, isChecked: boolean) => {
			if (isChecked) {
				setCustomScopes(Array.from(new Set([...customScopes, value])));
			} else {
				setCustomScopes(customScopes.filter((item) => item !== value));
			}
		},
		[customScopes],
	);

	useEffect(() => {
		if (session) {
			const scopes = Object.keys(session.sessionScopes);
			setCustomScopes(scopes);

			// Accumulate all accounts from all scopes
			const allAccounts: CaipAccountId[] = [];
			for (const scope of scopes) {
				const { accounts } = session.sessionScopes[scope as keyof typeof session.sessionScopes] ?? {};
				if (accounts && accounts.length > 0) {
					allAccounts.push(...accounts);
				}
			}
			setCaipAccountIds(allAccounts);
		}
	}, [session]);

	const scopesHaveChanged = useCallback(() => {
		if (!session) return false;
		const sessionScopes = Object.keys(session.sessionScopes);
		const currentScopes = customScopes.filter((scope) => scope.length);
		if (sessionScopes.length !== currentScopes.length) return true;
		return !sessionScopes.every((scope) => currentScopes.includes(scope)) || !currentScopes.every((scope) => sessionScopes.includes(scope));
	}, [session, customScopes]);

	const connect = useCallback(async () => {
		const selectedScopesArray = customScopes.filter((scope) => scope.length);
		const filteredAccountIds = caipAccountIds.filter((addr) => addr.trim() !== '');
		return sdkConnect(selectedScopesArray as Scope[], filteredAccountIds as CaipAccountId[]);
	}, [customScopes, caipAccountIds, sdkConnect]);

	const disconnect = useCallback(async () => {
		await sdkDisconnect();
	}, [sdkDisconnect]);

	const availableOptions = Object.keys(FEATURED_NETWORKS).reduce<{ name: string; value: string }[]>((all, networkName) => {
		const networkCaipValue = FEATURED_NETWORKS[networkName as keyof typeof FEATURED_NETWORKS];
		all.push({ name: networkName, value: networkCaipValue });
		return all;
	}, []);

	const isDisconnected = state === 'disconnected' || state === 'pending' || state === 'loaded';
	const isConnected = state === 'connected';
	const isConnecting = state === 'connecting';

	return (
		<div className="min-h-screen bg-gray-50 flex justify-center">
			<div className="max-w-6xl w-full p-8">
				<h1 className="text-slate-800 text-4xl font-bold mb-8 text-center">MetaMask MultiChain API Test Dapp</h1>
				<section className="bg-white rounded-lg p-8 mb-6 shadow-sm">
					<div className="mb-4">
						<DynamicInputs availableOptions={availableOptions} inputArray={customScopes} handleCheckboxChange={handleCheckboxChange} label={INPUT_LABEL_TYPE.SCOPE} />
					</div>

					{isConnecting && (
						<button type="button" onClick={connect} className="bg-blue-500 text-white px-5 py-2 rounded text-base mr-2 hover:bg-blue-600 transition-colors">
							Connecting
						</button>
					)}

					{isDisconnected && (
						<button type="button" onClick={connect} className="bg-blue-500 text-white px-5 py-2 rounded text-base mr-2 hover:bg-blue-600 transition-colors">
							Connect
						</button>
					)}

					{isConnected && (
						<button
							type="button"
							onClick={scopesHaveChanged() ? connect : disconnect}
							className="bg-blue-500 text-white px-5 py-2 rounded text-base hover:bg-blue-600 transition-colors"
						>
							{scopesHaveChanged() ? `Re Establishing Connection` : `Disconnect`}
						</button>
					)}
				</section>
				<section className="bg-white rounded-lg p-8 mb-6 shadow-sm">
					{Object.keys(session?.sessionScopes ?? {}).length > 0 && (
						<section className="mb-6">
							<h2 className="text-2xl font-bold text-gray-800 mb-6">Connected Networks</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{Object.entries(session?.sessionScopes ?? {}).map(([scope, details]) => {
									return <ScopeCard key={scope} scope={scope as Scope} details={details as SessionData['sessionScopes'][Scope]} />;
								})}
							</div>
						</section>
					)}
				</section>
			</div>
		</div>
	);
}

export default App;
