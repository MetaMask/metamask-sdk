import MetaMaskOpenRPCDocument from '@metamask/api-specs';
import type { Scope, SessionData } from '@metamask/multichain-sdk';
import { type CaipAccountId, type CaipChainId, type CaipAccountAddress, parseCaipAccountId, type Json } from '@metamask/utils';
import type { OpenrpcDocument, MethodObject } from '@open-rpc/meta-schema';
import { useState, useCallback } from 'react';
import { METHODS_REQUIRING_PARAM_INJECTION, injectParams } from '../constants/methods';
import { getNetworkName } from '../constants/networks';
import { escapeHtmlId } from '../helpers/IdHelpers';
import { openRPCExampleToJSON, truncateJSON } from '../helpers/JsonHelpers';
import { generateSolanaMethodExamples } from '../helpers/solana-method-signatures';
import { extractRequestForStorage, extractRequestParams, normalizeMethodParams, updateInvokeMethodResults } from '../helpers/MethodInvocationHelpers';
import { useSDK } from '../sdk';

const metamaskOpenrpcDocument: OpenrpcDocument = MetaMaskOpenRPCDocument;

export function ScopeCard({ scope, details }: { scope: Scope; details: SessionData['sessionScopes'][Scope] }) {
	const { accounts } = details;

	const setInitialMethodsAndAccounts = useCallback((currentSession: any) => {
		const initialSelectedMethods: Record<string, string> = {};
		const initialSelectedAccounts: Record<string, CaipAccountId> = {};
		const initialInvokeMethodRequests: Record<string, string> = {};

		Object.entries(currentSession.sessionScopes).forEach(([scope, details]: [string, any]) => {
			if (details.accounts?.[0]) {
				initialSelectedAccounts[scope] = details.accounts[0];
			}

			const getInvokeMethodRequest = (request: unknown) => ({
				method: 'wallet_invokeMethod',
				params: {
					scope,
					request,
				},
			});

			if (scope.startsWith('eip155:')) {
				initialSelectedMethods[scope] = 'eth_blockNumber';
				const example = metamaskOpenrpcDocument?.methods.find((method) => (method as MethodObject).name === 'eth_blockNumber');
				const request = openRPCExampleToJSON(example as MethodObject);
				const invokeMethodRequest = getInvokeMethodRequest(request);
				initialInvokeMethodRequests[scope] = JSON.stringify(invokeMethodRequest, null, 2);
			}
		});
		setInvokeMethodRequests(initialInvokeMethodRequests);
		setSelectedMethods(initialSelectedMethods);
		setSelectedAccounts(initialSelectedAccounts);
	}, []);

	const handleSessionChangedNotification = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(notification: any) => {
			if (notification.params?.sessionScopes) {
				setInitialMethodsAndAccounts({
					sessionScopes: notification.params.sessionScopes,
				});
			}
		},
		[setInitialMethodsAndAccounts],
	);
	const { invokeMethod } = useSDK({ onSessionChanged: handleSessionChangedNotification });

	const [invokeMethodResults, setInvokeMethodResults] = useState<Record<string, Record<string, { result: any; request: any }[]>>>({});
	const [selectedAccount, setSelectedAccount] = useState<CaipAccountId | undefined>(accounts?.length ? accounts[0] : undefined);
	const [invokeMethodRequests, setInvokeMethodRequests] = useState<Record<string, string>>({});
	const [selectedAccounts, setSelectedAccounts] = useState<Record<string, CaipAccountId | null>>({
		[scope]: accounts?.length ? (accounts[0] ?? null) : null,
	});
	const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});

	const networkName = getNetworkName(scope);
	const accountCount = accounts?.length ?? 0;

	const handleUpdateInvokeMethodSolana = async (scope: CaipChainId, address: CaipAccountAddress, method: string) => {
		if (!scope.startsWith('solana:')) {
			throw new Error('Invalid CAIP chain ID. It must start with "solana:"');
		}

		const solanaExample = await generateSolanaMethodExamples(method, address);

		const defaultRequest = {
			method: 'wallet_invokeMethod',
			params: {
				scope,
				request: {
					method,
					...solanaExample,
				},
			},
		};

		setInvokeMethodRequests((prev) => ({
			...prev,
			[scope]: JSON.stringify(defaultRequest, null, 2),
		}));
	};
	const handleMethodSelect = async (evt: React.ChangeEvent<HTMLSelectElement>, scope: CaipChainId) => {
		const selectedMethod = evt.target.value;
		setSelectedMethods((prev) => ({
			...prev,
			[scope]: selectedMethod,
		}));

		const selectedAddress = selectedAccounts[scope];
		if (!selectedAddress) {
			return;
		}

		if (scope.startsWith('solana:')) {
			await handleUpdateInvokeMethodSolana(scope, parseCaipAccountId(selectedAddress).address, selectedMethod);
		} else {
			const example = metamaskOpenrpcDocument?.methods.find((method) => (method as MethodObject).name === selectedMethod);
			if (example) {
				let exampleParams: Json = openRPCExampleToJSON(example as MethodObject);

				if (selectedMethod in METHODS_REQUIRING_PARAM_INJECTION) {
					exampleParams = injectParams(selectedMethod, exampleParams, selectedAddress, scope);
				}

				const defaultRequest = {
					method: 'wallet_invokeMethod',
					params: {
						scope,
						request: exampleParams,
					},
				};

				setInvokeMethodRequests((prev) => ({
					...prev,
					[scope]: JSON.stringify(defaultRequest, null, 2),
				}));
			}
		}
	};

	const handleInvokeMethod = async (scope: Scope, method: string, requestObject?: any) => {
		console.log(`🔧 handleInvokeMethod called: ${method} on ${scope}`);

		// Handle missing request gracefully
		const scopeRequest = invokeMethodRequests[scope];
		if (!requestObject && !scopeRequest) {
			throw new Error(`No request configured for method ${method} on scope ${scope}`);
		}

		const finalRequestObject = requestObject ?? JSON.parse(scopeRequest ?? '{}');
		console.log(`📋 Request object:`, finalRequestObject);

		try {
			// Extract and normalize parameters
			const params = extractRequestParams(finalRequestObject);
			console.log(`📤 Calling invokeMethod with params:`, params);

			const paramsArray = normalizeMethodParams(method, params);
			console.log(`📤 Normalized params array:`, paramsArray);

			const result = await invokeMethod({
				scope,
				request: {
					method,
					params: paramsArray,
				},
			});

			console.log(`📥 Received result:`, result);

			const request = extractRequestForStorage(finalRequestObject);
			setInvokeMethodResults((prev) => {
				const newResults = updateInvokeMethodResults(prev, scope, method, result as Json, request);
				console.log(`💾 Updated invoke results:`, newResults);
				return newResults;
			});
		} catch (error) {
			console.error('❌ Error invoking method:', error);

			const request = extractRequestForStorage(finalRequestObject);
			setInvokeMethodResults((prev) => {
				const newResults = updateInvokeMethodResults(prev, scope, method, error as Error, request);
				console.log(`💾 Updated invoke results (error):`, newResults);
				return newResults;
			});
		}
	};
	return (
		<div
			data-testid={`scope-card-${escapeHtmlId(scope)}`}
			key={scope}
			className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 title={`${networkName} (${scope})`} className="text-lg font-semibold text-gray-800 truncate">
					{networkName}
				</h3>
			</div>

			<div className="mb-4">
				<div className="flex items-center gap-2 mb-2">
					<span className="text-sm font-medium text-gray-600">Accounts:</span>
					<span className="text-sm text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{accountCount} available</span>
				</div>

				<select
					value={selectedAccount}
					onChange={async (evt) => {
						const selectedAccountValue = evt.target.value as CaipAccountId;
						setSelectedAccount(selectedAccountValue);
						setSelectedAccounts((prev) => ({
							...prev,
							[scope]: selectedAccountValue,
						}));
					}}
					data-testid={`accounts-select-${escapeHtmlId(scope)}`}
					id={`accounts-select-${escapeHtmlId(scope)}`}
					className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
				>
					<option value="">Select an account</option>
					{(accounts ?? []).map((account: CaipAccountId) => {
						const { address } = parseCaipAccountId(account);
						return (
							<option data-testid={`${escapeHtmlId(String(account))}-option`} key={address} value={account}>
								{address}
							</option>
						);
					})}
				</select>
			</div>

			{selectedAccount && (
				<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
					<p className="text-sm text-green-800 font-medium">Active Account:</p>
					<p className="text-sm text-green-700 font-mono break-all">{parseCaipAccountId(selectedAccount).address}</p>
				</div>
			)}

			<div className="mb-4">
				<div className="flex items-center gap-2 mb-2">
					<span className="text-sm font-medium text-gray-600">Available Methods:</span>
					<span className="text-sm text-gray-500 bg-purple-50 text-purple-700 px-2 py-1 rounded-full">{details.methods?.length ?? 0} available</span>
				</div>

				<select
					data-testid={`${escapeHtmlId(scope)}-select`}
					value={selectedMethods[scope] ?? ''}
					onChange={async (evt) => {
						await handleMethodSelect(evt, scope);
					}}
					id={`method-select-${escapeHtmlId(scope)}`}
					className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white hover:border-gray-400"
				>
					<option value="">Select a method to invoke</option>
					{(details.methods ?? []).map((method: string) => (
						<option data-testid={`${escapeHtmlId(scope)}-${method}-option`} key={method} value={method}>
							{method}
						</option>
					))}
				</select>
			</div>

			{selectedMethods[scope] && (
				<div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
					<p className="text-sm text-purple-800 font-medium">Selected Method:</p>
					<p className="text-sm text-purple-700 font-mono">{selectedMethods[scope]}</p>
				</div>
			)}

			<details className="mt-4 border border-gray-200 rounded-lg" data-testid={`invoke-method-details-${escapeHtmlId(scope)}`} id={`invoke-method-details-${escapeHtmlId(scope)}`}>
				<summary className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-150 rounded-t-lg flex items-center gap-2 font-medium text-gray-700">
					<svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<title>Invoke Method</title>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
					Invoke Method Request
				</summary>
				<div className="p-4 bg-white border-t border-gray-200">
					<div className="mb-2">
						<label htmlFor={`invoke-method-request-${escapeHtmlId(scope)}`} className="block text-sm font-medium text-gray-600 mb-1">
							JSON Request:
						</label>
					</div>
					<textarea
						data-testid={`${escapeHtmlId(scope)}-collapsible-content-textarea`}
						value={invokeMethodRequests[scope] ?? ''}
						onChange={(evt) => setInvokeMethodRequests((prev) => ({ ...prev, [scope]: evt.target.value }))}
						rows={12}
						id={`invoke-method-request-${escapeHtmlId(scope)}`}
						className="w-full p-3 font-mono text-sm border border-gray-300 rounded-md resize-y min-h-[200px] max-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
						placeholder="Method request will appear here..."
						spellCheck={false}
					/>
					<div className="mt-2 text-xs text-gray-500">Edit the JSON above to customize the request parameters before invoking the method.</div>
				</div>
			</details>

			<button
				type="button"
				data-testid={`invoke-method-${escapeHtmlId(scope)}-btn`}
				onClick={async () => {
					const method = selectedMethods[scope];
					if (method) {
						await handleInvokeMethod(scope as Scope, method);
					}
				}}
				id={`invoke-method-${escapeHtmlId(scope)}-btn`}
				disabled={!selectedMethods[scope] || !invokeMethodRequests[scope]}
				className={`
            w-full mt-4 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200
            flex items-center justify-center gap-2
            ${
							!selectedMethods[scope] || !invokeMethodRequests[scope]
								? 'bg-gray-300 cursor-not-allowed text-gray-500'
								: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
						}
          `}
			>
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<title>Invoke Method</title>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Invoke Method
			</button>

			{Object.entries(invokeMethodResults[scope] ?? {}).map(([method, results]) => {
				return results.map(({ result, request }, index) => {
					const { text, truncated } = truncateJSON(result, 150);
					const isError = result instanceof Error;
					return truncated ? (
						<details
							// biome-ignore lint/suspicious/noArrayIndexKey: Needed
							key={`${method}-${index}`}
							data-testid={`method-result-details-${escapeHtmlId(scope)}-${method}-${index}`}
							id={`method-result-details-${escapeHtmlId(scope)}-${method}-${index}`}
							className="mt-4 border border-gray-200 rounded-lg"
						>
							<summary className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 rounded-t-lg ${isError ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<title>Scope card</title>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<span className={`font-mono text-sm font-medium ${isError ? 'text-red-700' : 'text-purple-700'}`}>{method}</span>
											<span className={`text-xs px-2 py-1 rounded-full ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
												{isError ? 'Error' : 'Success'}
											</span>
										</div>
										<div className="text-xs text-gray-500 mb-1">
											<span className="font-medium">Params:</span> {JSON.stringify(request.params)}
										</div>
										<div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">{text}...</div>
									</div>
								</div>
							</summary>
							<div className="p-4 bg-white border-t border-gray-200">
								<div className="mb-2">
									<div className="block text-sm font-medium text-gray-600 mb-1">Full Response:</div>
								</div>
								<div className="relative">
									<pre className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 text-left">
										<code id={`invoke-method-${escapeHtmlId(scope)}-${method}-result-${index}`} className={isError ? 'text-red-600' : 'text-gray-800'}>
											{JSON.stringify(result, null, 2)}
										</code>
									</pre>
								</div>
							</div>
						</details>
					) : (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: Needed
							key={`${method}-${index}`}
							className="mt-4 border border-gray-200 rounded-lg bg-white"
							data-testid={`method-result-item-${escapeHtmlId(scope)}-${method}-${index}`}
							id={`method-result-item-${escapeHtmlId(scope)}-${method}-${index}`}
						>
							<div className={`px-4 py-3 border-b border-gray-200 ${isError ? 'bg-red-50' : 'bg-gray-50'}`}>
								<div className="flex items-center gap-2 mb-1">
									<span className={`font-mono text-sm font-medium ${isError ? 'text-red-700' : 'text-purple-700'}`}>{method}</span>
									<span className={`text-xs px-2 py-1 rounded-full ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{isError ? 'Error' : 'Success'}</span>
								</div>
							</div>
							<div className="p-4">
								<div className="relative">
									<pre className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 text-left">
										<code id={`invoke-method-${escapeHtmlId(scope)}-${method}-result-${index}`} className={isError ? 'text-red-600' : 'text-gray-800'}>
											{text}
										</code>
									</pre>
								</div>
							</div>
						</div>
					);
				});
			})}
		</div>
	);
}
