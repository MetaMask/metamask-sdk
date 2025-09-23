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
	const { isConnected, session, connect: sdkConnect, disconnect: sdkDisconnect } = useSDK();

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

	// Check if current scope selection differs from connected session scopes
	const scopesHaveChanged = () => {
		if (!session) return false;
		const sessionScopes = Object.keys(session.sessionScopes);
		const currentScopes = customScopes.filter((scope) => scope.length);
		if (sessionScopes.length !== currentScopes.length) return true;
		return !sessionScopes.every((scope) => currentScopes.includes(scope)) || !currentScopes.every((scope) => sessionScopes.includes(scope));
	};

	const connect = useCallback(async () => {
		try {
			const selectedScopesArray = customScopes.filter((scope) => scope.length);
			const filteredAccountIds = caipAccountIds.filter((addr) => addr.trim() !== '');
			await sdkConnect(selectedScopesArray as Scope[], filteredAccountIds as CaipAccountId[]);
		} catch (error) {
			console.error('Error creating session:', error);
		}
	}, [customScopes, caipAccountIds]);

	const disconnect = useCallback(async () => {
		await sdkDisconnect();
	}, [sdkDisconnect]);

	const availableOptions = Object.keys(FEATURED_NETWORKS).reduce<{ name: string; value: string }[]>((all, networkName) => {
		const networkCaipValue = FEATURED_NETWORKS[networkName as keyof typeof FEATURED_NETWORKS];
		all.push({ name: networkName, value: networkCaipValue });
		return all;
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 flex justify-center">
			<div className="max-w-6xl w-full p-8">
				<h1 className="text-slate-800 text-4xl font-bold mb-8 text-center">MetaMask MultiChain API Test Dapp</h1>
				<section className="bg-white rounded-lg p-8 mb-6 shadow-sm">
					<div className="mb-4">
						<DynamicInputs availableOptions={availableOptions} inputArray={customScopes} setInputArray={setCustomScopes} label={INPUT_LABEL_TYPE.SCOPE} />
					</div>
					{(!isConnected || scopesHaveChanged()) && (
						<button type="button" onClick={connect} className="bg-blue-500 text-white px-5 py-2 rounded text-base mr-2 hover:bg-blue-600 transition-colors">
							{isConnected && scopesHaveChanged() ? 'Re Establish Connection' : 'Connect'}
						</button>
					)}
					{isConnected && (
						<button type="button" onClick={disconnect} className="bg-blue-500 text-white px-5 py-2 rounded text-base hover:bg-blue-600 transition-colors">
							Disconnect
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
