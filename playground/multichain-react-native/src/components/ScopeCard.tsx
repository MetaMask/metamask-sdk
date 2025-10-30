/** biome-ignore-all lint/suspicious/noExplicitAny: ok */
import MetaMaskOpenRPCDocument from '@metamask/api-specs';
import type { Scope, SessionData } from '@metamask/multichain-sdk';
import { type CaipAccountId, type CaipChainId, type CaipAccountAddress, parseCaipAccountId, type Json } from '@metamask/utils';
import type { OpenrpcDocument, MethodObject } from '@open-rpc/meta-schema';
import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { METHODS_REQUIRING_PARAM_INJECTION, injectParams } from '../constants/methods';
import { getNetworkName } from '../constants/networks';
import { openRPCExampleToJSON, truncateJSON } from '../helpers/JsonHelpers';
import { generateSolanaMethodExamples } from '../helpers/solana-method-signatures';
import { extractRequestForStorage, extractRequestParams, normalizeMethodParams, updateInvokeMethodResults } from '../helpers/MethodInvocationHelpers';
import { useSDK } from '../sdk';
import { colors, sharedStyles } from '../styles/shared';

const metamaskOpenrpcDocument: OpenrpcDocument = MetaMaskOpenRPCDocument;

export function ScopeCard({ scope, details }: { scope: Scope; details: SessionData['sessionScopes'][Scope] }) {
	const { accounts } = details;

	const setInitialMethodsAndAccounts = useCallback((currentSession: { sessionScopes: SessionData['sessionScopes'] }) => {
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
		(currentSession: SessionData | undefined) => {
			if (currentSession?.sessionScopes) {
				setInitialMethodsAndAccounts({
					sessionScopes: currentSession.sessionScopes,
				});
			}
		},
		[setInitialMethodsAndAccounts],
	);
	const { invokeMethod, session } = useSDK();

	useEffect(() => {
		handleSessionChangedNotification(session);
	}, [session, handleSessionChangedNotification]);

	const [invokeMethodResults, setInvokeMethodResults] = useState<Record<string, Record<string, { result: any; request: any }[]>>>({});
	const [selectedAccount, setSelectedAccount] = useState<CaipAccountId | undefined>(accounts?.length ? accounts[0] : undefined);
	const [invokeMethodRequests, setInvokeMethodRequests] = useState<Record<string, string>>({});
	const [selectedAccounts, setSelectedAccounts] = useState<Record<string, CaipAccountId | null>>({
		[scope]: accounts?.length ? (accounts[0] ?? null) : null,
	});
	const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});
	const [isRequestExpanded, setIsRequestExpanded] = useState(false);

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
	const handleMethodSelect = async (selectedMethod: string, scope: CaipChainId) => {
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

			const normalizedParams = normalizeMethodParams(method, params, scope);
			console.log(`📤 Normalized params:`, normalizedParams);

			const result = await invokeMethod({
				scope,
				request: {
					method,
					params: normalizedParams,
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
		<View style={styles.card}>
			<View style={styles.header}>
				<Text style={styles.networkName} numberOfLines={1}>
					{networkName}
				</Text>
			</View>

			<View style={styles.section}>
				<View style={sharedStyles.row}>
					<Text style={styles.sectionLabel}>Accounts:</Text>
					<View style={[sharedStyles.badge, sharedStyles.badgeBlue, { marginLeft: 8 }]}>
						<Text style={[sharedStyles.badgeText, sharedStyles.badgeTextBlue]}>{accountCount} available</Text>
					</View>
				</View>

				<View style={sharedStyles.pickerContainer}>
					<Picker
						selectedValue={selectedAccount}
						onValueChange={async (itemValue) => {
							const selectedAccountValue = itemValue as CaipAccountId;
							setSelectedAccount(selectedAccountValue);
							setSelectedAccounts((prev) => ({
								...prev,
								[scope]: selectedAccountValue,
							}));
						}}
						style={sharedStyles.picker}
					>
						<Picker.Item label="Select an account" value="" />
						{(accounts ?? []).map((account: CaipAccountId) => {
							const { address } = parseCaipAccountId(account);
							return <Picker.Item key={address} label={address} value={account} />;
						})}
					</Picker>
				</View>
			</View>

			{selectedAccount && (
				<View style={[sharedStyles.badge, sharedStyles.badgeGreen, { marginBottom: 12, alignSelf: 'stretch' }]}>
					<Text style={[sharedStyles.badgeText, sharedStyles.badgeTextGreen]}>Active Account:</Text>
					<Text style={[sharedStyles.textMono, sharedStyles.badgeTextGreen, { marginTop: 4 }]}>{parseCaipAccountId(selectedAccount).address}</Text>
				</View>
			)}

			<View style={styles.section}>
				<View style={sharedStyles.row}>
					<Text style={styles.sectionLabel}>Available Methods:</Text>
					<View style={[sharedStyles.badge, sharedStyles.badgePurple, { marginLeft: 8 }]}>
						<Text style={[sharedStyles.badgeText, sharedStyles.badgeTextPurple]}>{details.methods?.length ?? 0} available</Text>
					</View>
				</View>

				<View style={sharedStyles.pickerContainer}>
					<Picker
						selectedValue={selectedMethods[scope] ?? ''}
						onValueChange={async (itemValue) => {
							await handleMethodSelect(itemValue, scope);
						}}
						style={sharedStyles.picker}
					>
						<Picker.Item label="Select a method to invoke" value="" />
						{(details.methods ?? []).map((method: string) => (
							<Picker.Item key={method} label={method} value={method} />
						))}
					</Picker>
				</View>
			</View>

			{selectedMethods[scope] && (
				<View style={[sharedStyles.badge, sharedStyles.badgePurple, { marginBottom: 12, alignSelf: 'stretch' }]}>
					<Text style={[sharedStyles.badgeText, sharedStyles.badgeTextPurple]}>Selected Method:</Text>
					<Text style={[sharedStyles.textMono, sharedStyles.badgeTextPurple, { marginTop: 4 }]}>{selectedMethods[scope]}</Text>
				</View>
			)}

			<TouchableOpacity
				style={[sharedStyles.collapsibleHeader, { marginTop: 12 }]}
				onPress={() => setIsRequestExpanded(!isRequestExpanded)}
				activeOpacity={0.7}
			>
				<Text style={styles.arrow}>{isRequestExpanded ? '▼' : '▶'}</Text>
				<Text style={sharedStyles.collapsibleHeaderText}>Invoke Method Request</Text>
			</TouchableOpacity>

			{isRequestExpanded && (
				<View style={sharedStyles.collapsibleContent}>
					<Text style={[styles.sectionLabel, { marginBottom: 8 }]}>JSON Request:</Text>
					<TextInput
						value={invokeMethodRequests[scope] ?? ''}
						onChangeText={(text) => setInvokeMethodRequests((prev) => ({ ...prev, [scope]: text }))}
						multiline
						numberOfLines={12}
						style={sharedStyles.textArea}
						placeholder="Method request will appear here..."
					/>
					<Text style={[sharedStyles.textSmall, { marginTop: 8 }]}>Edit the JSON above to customize the request parameters before invoking the method.</Text>
				</View>
			)}

			<TouchableOpacity
				onPress={async () => {
					const method = selectedMethods[scope];
					if (method) {
						await handleInvokeMethod(scope as Scope, method);
					}
				}}
				disabled={!selectedMethods[scope] || !invokeMethodRequests[scope]}
				style={[sharedStyles.button, { marginTop: 12 }, (!selectedMethods[scope] || !invokeMethodRequests[scope]) && sharedStyles.buttonDisabled]}
			>
				<Text style={[sharedStyles.buttonText, (!selectedMethods[scope] || !invokeMethodRequests[scope]) && sharedStyles.buttonTextDisabled]}>⚡ Invoke Method</Text>
			</TouchableOpacity>

			{Object.entries(invokeMethodResults[scope] ?? {}).map(([method, results]) => {
				return results.map(({ result, request }, index) => {
					const { text, truncated } = truncateJSON(result, 150);
					const isError = result instanceof Error;
					return (
						<View key={`${method}-${index}`} style={[sharedStyles.resultContainer, { marginTop: 12 }]}>
							<View style={[sharedStyles.resultHeader, isError && sharedStyles.resultHeaderError]}>
								<View style={sharedStyles.row}>
									<Text style={[sharedStyles.textMono, { fontWeight: '600', color: isError ? colors.red700 : colors.purple700 }]}>{method}</Text>
									<View style={[sharedStyles.badge, isError ? sharedStyles.badgeRed : sharedStyles.badgeGreen, { marginLeft: 8 }]}>
										<Text style={[sharedStyles.badgeText, isError ? sharedStyles.badgeTextRed : sharedStyles.badgeTextGreen]}>{isError ? 'Error' : 'Success'}</Text>
									</View>
								</View>
								<Text style={[sharedStyles.textSmall, { marginTop: 4 }]}>
									<Text style={{ fontWeight: '600' }}>Params:</Text> {JSON.stringify(request.params)}
								</Text>
								{truncated && <Text style={[sharedStyles.textMono, { marginTop: 4, fontSize: 11 }]}>{text}...</Text>}
							</View>
							<View style={sharedStyles.resultContent}>
								<View style={sharedStyles.resultCode}>
									<Text style={[sharedStyles.resultCodeText, isError && sharedStyles.resultCodeTextError]}>{truncated ? JSON.stringify(result, null, 2) : text}</Text>
								</View>
							</View>
						</View>
					);
				});
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: colors.black,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	header: {
		marginBottom: 12,
	},
	networkName: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.gray800,
	},
	section: {
		marginBottom: 12,
	},
	sectionLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: colors.gray600,
	},
	arrow: {
		fontSize: 12,
		color: colors.gray600,
	},
});

