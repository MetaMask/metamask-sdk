/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  CAIP294EventNames,
  createMultichainAPI,
  discoverWallets,
  FEATURED_NETWORKS,
  injectParams,
  METHODS_REQUIRING_PARAM_INJECTION,
  openRPCExampleToJSON,
  SessionData,
  truncateJSON,
} from '@metamask/multichainapi';
import {
  CaipAccountId,
  CaipChainId,
  Json,
  parseCaipAccountId,
} from '@metamask/utils';
import { MethodObject, OpenrpcDocument } from '@open-rpc/meta-schema';
import { useCallback, useEffect, useState } from 'react';
import DynamicInputs, { INPUT_LABEL_TYPE } from '../components/DynamicInputs';
import WalletList, { WalletMapEntry } from '../components/WalletList';
import { MetaMaskOpenRPCDocument } from '@metamask/api-specs';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';

import styles from './page.module.css';

type NetworkId = keyof typeof FEATURED_NETWORKS;

interface AccountInfo {
  account: string;
  balance: string;
  chainId: NetworkId;
  sessionId: string;
}

interface SessionMethodResult {
  timestamp: number;
  method: string;
  data: unknown;
}

interface WalletHistoryEntry {
  timestamp: number;
  data: unknown;
}

const defaultSessionsScopes: Record<NetworkId, string> = {
  'eip155:1': '',
  'eip155:59144': '',
  'eip155:42161': '',
  'eip155:43114': '',
  'eip155:56': '',
  'eip155:10': '',
  'eip155:137': '',
  'eip155:324': '',
  'eip155:8453': '',
  'eip155:1337': '',
};

interface ConnectWalletParams {
  extensionId: string;
}

export default function Home() {
  const [api, setApi] = useState<ReturnType<typeof createMultichainAPI> | null>(
    null,
  );
  const [accountInfo, setAccountInfo] = useState<AccountInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extensionId, setExtensionId] = useState<string>(
    'nfdjnfhlblppdgdplngdjgpifllaamoc',
  );
  const [selectedChains, setSelectedChains] = useState<
    Record<NetworkId, boolean>
  >({
    'eip155:1': true,
    'eip155:59144': true,
    'eip155:42161': false,
    'eip155:43114': false,
    'eip155:56': false,
    'eip155:10': false,
    'eip155:137': false,
    'eip155:324': false,
    'eip155:8453': false,
    'eip155:1337': false,
  });
  const [walletSessionChangedHistory, setWalletSessionChangedHistory] =
    useState<WalletHistoryEntry[]>([]);
  const [walletNotifyHistory, setWalletNotifyHistory] = useState<
    WalletHistoryEntry[]
  >([]);
  const [invokeMethodRequests, setInvokeMethodRequests] = useState<
    Record<string, string>
  >({});
  const [metamaskOpenrpcDocument, setMetamaskOpenrpcDocument] =
    useState<OpenrpcDocument>();
  const [sessionMethodHistory, setSessionMethodHistory] = useState<
    SessionMethodResult[]
  >([]);
  const [selectedAccounts, setSelectedAccounts] = useState<
    Record<string, CaipAccountId>
  >({});
  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, string>
  >({});
  const [invokeMethodResults, setInvokeMethodResults] = useState<
    Record<string, Record<string, { result: any; request: any }[]>>
  >({});
  const [sessionsScopes, setSessionsScopes] = useState<
    Record<NetworkId, string>
  >(defaultSessionsScopes);
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [walletMapEntries, setWalletMapEntries] = useState<
    Record<string, WalletMapEntry>
  >({});
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null,
  );

  // Add computed property for connection status
  const isConnected = Boolean(
    currentSession?.sessionId ||
      Object.keys(currentSession?.sessionScopes || {}).length > 0,
  );

  // Initialize API
  useEffect(() => {
    const multichain = createMultichainAPI();
    setApi(multichain);
  }, []);

  useEffect(() => {
    let mounted = true;

    const discoverAvailableWallets = async () => {
      console.log('discoverAvailableWallets');

      // Add debug listener to see if events are being fired
      const debugListener = (e: Event) => {
        console.log('Raw wallet event received:', e);
      };
      window.addEventListener(CAIP294EventNames.Announce, debugListener);

      const wallets = await discoverWallets({
        timeout: 3000, // Increased timeout to ensure we don't miss announcements
        filterPredicate: (wallet) => {
          console.log('Filtering wallet:', wallet);
          return true;
        },
      });

      console.log('Discovered wallets:', wallets);

      if (mounted) {
        const entries = wallets.reduce<Record<string, WalletMapEntry>>(
          (acc, wallet) => ({
            ...acc,
            [wallet.providerId]: {
              params: {
                name: wallet.name,
                uuid: wallet.providerId,
                rdns: wallet.rdns,
                icon: wallet.icon,
                extensionId: wallet.providerId,
              },
            },
          }),
          {},
        );
        setWalletMapEntries(entries);
      }

      // Cleanup debug listener
      window.removeEventListener(CAIP294EventNames.Announce, debugListener);
    };

    discoverAvailableWallets().catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    parseOpenRPCDocument(MetaMaskOpenRPCDocument as OpenrpcDocument)
      .then((parsedOpenRPCDocument) => {
        console.log('parsedOpenRPCDocument', parsedOpenRPCDocument);
        setMetamaskOpenrpcDocument(parsedOpenRPCDocument);
      })
      .catch(() => {
        console.error('Error parsing metamask openrpc document');
      });
  }, []);

  const handleClearInvokeResults = () => {
    setInvokeMethodResults({});
  };

  const setInitialMethodsAndAccounts = useCallback(
    (currentSession: SessionData) => {
      const initialSelectedMethods: Record<string, string> = {};
      const initialSelectedAccounts: Record<string, CaipAccountId> = {};

      Object.entries(currentSession.sessionScopes).forEach(
        ([scope, details]: [string, any]) => {
          if (details.accounts && details.accounts.length > 0) {
            initialSelectedAccounts[scope] = details.accounts[0];
          }
          initialSelectedMethods[scope] = 'eth_blockNumber';
          const example = metamaskOpenrpcDocument?.methods.find(
            (method) => (method as MethodObject).name === 'eth_blockNumber',
          );

          const defaultRequest = {
            method: 'wallet_invokeMethod',
            params: {
              scope,
              request: openRPCExampleToJSON(example as MethodObject),
            },
          };

          setInvokeMethodRequests((prev) => ({
            ...prev,
            [scope]: JSON.stringify(defaultRequest, null, 2),
          }));
        },
      );
      setSelectedMethods(initialSelectedMethods);
      setSelectedAccounts(initialSelectedAccounts);
    },
    [metamaskOpenrpcDocument],
  );

  const connectWallet = useCallback(
    async ({ extensionId }: ConnectWalletParams): Promise<void> => {
      if (!api) {
        console.debug('[Wallet] Cannot connect - API not initialized');
        return;
      }

      try {
        setIsLoading(true);
        console.debug(
          '[Wallet] Attempting to connect to extension:',
          extensionId,
        );
        const connected = await api.connect({ extensionId });

        if (!connected) {
          console.debug(
            '[Wallet] Connection failed - received false from api.connect',
          );
          throw new Error('Failed to connect to extension');
        }
        console.debug('[Wallet] Successfully connected to extension');

        // Create sessions for all selected chains
        const selectedChainIds = Object.entries(selectedChains)
          .filter(([_, isSelected]) => isSelected)
          .map(([chainId]) => chainId as NetworkId);

        console.debug(
          '[Wallet] Creating sessions for chains:',
          selectedChainIds,
        );

        const newSessions = { ...defaultSessionsScopes };
        const newAccountInfo: AccountInfo[] = [];

        for (const chainId of selectedChainIds) {
          try {
            const session = await api.createSession({
              optionalScopes: {
                [chainId]: {
                  methods: ['eth_getBalance'],
                  accounts: [`${chainId}:0x0`],
                },
              },
            });
            newSessions[chainId] = session.sessionId ?? '';
            setCurrentSession(session);
          } catch (err) {
            console.error(`Failed to create session for ${chainId}:`, err);
          }
        }

        setSessionsScopes(newSessions);
        setAccountInfo(newAccountInfo);
      } catch (error) {
        console.error('[Wallet] Connection error:', error);
        throw error;
      } finally {
        setIsLoading(false);
        console.debug('[Wallet] Connection attempt completed');
      }
    },
    [api, selectedChains],
  );

  const terminateConnection = async (): Promise<void> => {
    if (!api) return;

    try {
      setIsLoading(true);

      // Revoke all sessions
      await Promise.all(
        Object.values(sessionsScopes).map((sessionId) =>
          api.revokeSession({ sessionId }),
        ),
      );

      // Reset all state after terminating sessions
      handleResetState();
      setAccountInfo([]);
      setSessionsScopes(defaultSessionsScopes);
      setCurrentSession(null);
    } catch (err) {
      console.error('Failed to terminate connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletListClick = useCallback(
    async (newExtensionId: string): Promise<void> => {
      console.debug('[Wallet] Wallet selection clicked:', newExtensionId);
      setExtensionId(newExtensionId);
      try {
        await connectWallet({ extensionId: newExtensionId });
        console.debug('[Wallet] Connection successful for:', newExtensionId);
      } catch (error) {
        console.error('[Wallet] Error in handleWalletListClick:', error);
      }
    },
    [connectWallet],
  );

  const handleCreateSession = async () => {
    const selectedChainsArray = Object.keys(selectedChains).filter(
      (chain) => selectedChains[chain as NetworkId],
    ) as NetworkId[];

    try {
      if (!api) return;

      const result = await api.createSession({
        optionalScopes: selectedChainsArray.reduce(
          (acc, chainId) => ({
            ...acc,
            [chainId]: {
              methods: ['eth_getBalance'],
              accounts: addresses,
            },
          }),
          {},
        ),
      });

      setSessionMethodHistory((prev) => [
        { timestamp: Date.now(), method: 'wallet_createSession', data: result },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleGetSession = async () => {
    try {
      if (!api || !currentSession?.sessionId) return;
      const result = await api.getSession({
        sessionId: currentSession.sessionId,
      });
      setSessionMethodHistory((prev) => [
        { timestamp: Date.now(), method: 'wallet_getSession', data: result },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error getting session:', error);
    }
  };

  const handleRevokeSession = async () => {
    if (!api || !currentSession?.sessionId) return;

    try {
      const result = await api.revokeSession({
        sessionId: currentSession.sessionId,
      });
      setSessionMethodHistory((prev) => [
        { timestamp: Date.now(), method: 'wallet_revokeSession', data: result },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleResetState = () => {
    setSelectedMethods({});
    setInvokeMethodResults({});
    setWalletSessionChangedHistory([]);
    setWalletNotifyHistory([]);
    setSessionMethodHistory([]);
    setSelectedChains({
      'eip155:1': false,
      'eip155:59144': false,
      'eip155:42161': false,
      'eip155:43114': false,
      'eip155:56': false,
      'eip155:10': false,
      'eip155:137': false,
      'eip155:324': false,
      'eip155:8453': false,
      'eip155:1337': false,
    });
  };

  const handleSessionChangedNotification = useCallback(
    (notification: any) => {
      setWalletSessionChangedHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [{ timestamp, data: notification }, ...prev];
      });

      if (notification.params?.sessionScopes) {
        setSelectedChains(notification.params.sessionScopes);
        setInitialMethodsAndAccounts(notification.params.sessionScopes);
      }
    },
    [
      setWalletSessionChangedHistory,
      setSelectedChains,
      setInitialMethodsAndAccounts,
    ],
  );

  const handleInvokeAllMethods = async () => {
    const scopesWithMethods = Object.entries(selectedMethods)
      .filter(([_, method]) => method)
      .map(([scope, method]) => ({ scope, method }));

    await Promise.all(
      scopesWithMethods.map(async ({ scope, method }) => {
        const scopeToInvoke = scope as keyof typeof selectedChains;
        return handleInvokeMethod(scopeToInvoke, method);
      }),
    );
  };

  const handleMethodSelect = (
    evt: React.ChangeEvent<HTMLSelectElement>,
    scope: CaipChainId,
  ) => {
    const selectedMethod = evt.target.value;
    setSelectedMethods((prev) => ({
      ...prev,
      [scope]: selectedMethod,
    }));

    const example = metamaskOpenrpcDocument?.methods.find(
      (method) => (method as MethodObject).name === selectedMethod,
    );

    if (example) {
      let exampleParams: Json = openRPCExampleToJSON(example as MethodObject);
      const selectedAddress = selectedAccounts[scope];

      if (
        selectedAddress &&
        selectedMethod in METHODS_REQUIRING_PARAM_INJECTION
      ) {
        exampleParams = injectParams(
          selectedMethod,
          exampleParams,
          selectedAddress,
          scope,
        );
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
  };

  const handleInvokeMethod = async (scope: CaipChainId, method: string) => {
    const requestObject = JSON.parse(invokeMethodRequests[scope] ?? '{}');
    try {
      if (!api) return;
      const { params } = requestObject.params.request;
      const result = await api.invokeMethod({
        scope,
        request: {
          method,
          params,
        },
      });

      setInvokeMethodResults((prev) => {
        const scopeResults = prev[scope] ?? {};
        const methodResults = scopeResults[method] ?? [];
        return {
          ...prev,
          [scope]: {
            ...scopeResults,
            [method]: [
              ...methodResults,
              { result, request: requestObject.params.request },
            ],
          },
        };
      });
    } catch (error) {
      setInvokeMethodResults((prev) => {
        const scopeResults = prev[scope] ?? {};
        const methodResults = scopeResults[method] ?? [];
        return {
          ...prev,
          [scope]: {
            ...scopeResults,
            [method]: [
              ...methodResults,
              { result: error, request: requestObject.params.request },
            ],
          },
        };
      });
      console.error('Error invoking method:', error);
    }
  };

  useEffect(() => {
    if (currentSession?.sessionScopes) {
      setInitialMethodsAndAccounts(currentSession);
    }
  }, [currentSession, setInitialMethodsAndAccounts]);

  // Add useEffect to set up session change listener when API is initialized
  useEffect(() => {
    if (api) {
      api.addListener('sessionChanged', handleSessionChangedNotification);

      // Clean up listener when component unmounts or API changes
      return () => {
        api.removeListener('sessionChanged', handleSessionChangedNotification);
      };
    }
  }, [api, handleSessionChangedNotification]);

  return (
    <div className={styles.container}>
      <h1>MetaMask MultiChain API Test Dapp</h1>

      <div>
        <input
          type="text"
          placeholder="Extension ID"
          value={extensionId}
          onChange={(e) => setExtensionId(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <section>
        <div>
          <h2>Detected Wallets</h2>
        </div>
        <div>
          <WalletList
            wallets={walletMapEntries}
            handleClick={handleWalletListClick}
            connectedExtensionId={isConnected ? extensionId : ''}
          />
        </div>
      </section>

      <section>
        <div>
          <h2>Session Lifecycle</h2>
          <div className="session-layout">
            <div className="session-column">
              <div className="create-session-container">
                <h3>Create Session</h3>
                {Object.entries(FEATURED_NETWORKS).map(
                  ([chainId, networkName]) => (
                    <label key={chainId}>
                      <input
                        type="checkbox"
                        name={chainId}
                        checked={selectedChains[chainId as NetworkId] ?? false}
                        onChange={(evt) =>
                          setSelectedChains((prev) => ({
                            ...prev,
                            [chainId]: evt.target.checked,
                          }))
                        }
                        disabled={!isConnected}
                      />{' '}
                      {networkName}
                    </label>
                  ),
                )}
                <div>
                  <DynamicInputs
                    inputArray={Object.keys(selectedChains).filter(
                      (chain) => selectedChains[chain as NetworkId],
                    )}
                    setInputArray={(newArray) => {
                      // Convert array back to record
                      const newSelectedChains = { ...selectedChains };
                      Object.keys(selectedChains).forEach((chain) => {
                        newSelectedChains[chain as NetworkId] = Array.isArray(
                          newArray,
                        )
                          ? newArray.includes(chain)
                          : false;
                      });
                      setSelectedChains(newSelectedChains);
                    }}
                    label={INPUT_LABEL_TYPE.SCOPE}
                  />
                </div>
                <div>
                  <DynamicInputs
                    inputArray={addresses}
                    setInputArray={setAddresses}
                    label={INPUT_LABEL_TYPE.ADDRESS}
                  />
                </div>
                <div className="session-lifecycle-buttons">
                  <button
                    id="create-session-btn"
                    onClick={handleCreateSession}
                    disabled={!isConnected}
                  >
                    <span className="code-method">wallet_createSession</span>
                  </button>
                  <button
                    id="get-session-btn"
                    onClick={handleGetSession}
                    disabled={!isConnected}
                  >
                    <span className="code-method">wallet_getSession</span>
                  </button>
                  <button
                    id="revoke-session-btn"
                    onClick={handleRevokeSession}
                    disabled={!isConnected}
                  >
                    <span className="code-method">wallet_revokeSession</span>
                  </button>
                </div>
              </div>

              {currentSession && (
                <div className="session-info">
                  <h3>Connected Accounts</h3>
                  <ul className="connection-list">
                    {(currentSession?.sessionScopes &&
                      Object.values(currentSession.sessionScopes)
                        .flatMap((scope) => scope.accounts ?? [])
                        .map((account) => parseCaipAccountId(account).address)
                        .filter((address: string) => address !== '')
                        .filter(
                          (address: string, index: number, array: string[]) =>
                            array.indexOf(address) === index,
                        )
                        .map((address: string) => (
                          <li key={address}>{address}</li>
                        ))) || <li>No accounts connected</li>}
                  </ul>

                  <h3>Connected Chains</h3>
                  <ul className="connection-list">
                    {Object.keys(currentSession?.sessionScopes ?? {}).map(
                      (chain: string) => <li key={chain}>{chain}</li>,
                    ) ?? <li>No chains connected</li>}
                  </ul>
                </div>
              )}
            </div>

            <div className="session-column">
              {/* Session Results */}
              <div className="results-section">
                <h3>Session Lifecycle method results</h3>
                <div className="notification-container">
                  {sessionMethodHistory.length > 0 ? (
                    sessionMethodHistory.map(
                      ({ timestamp, method, data }, index) => (
                        <details key={timestamp}>
                          <summary className="result-summary">
                            <span className="timestamp">
                              {new Date(timestamp).toLocaleString()}
                            </span>
                            <span className="method-name">{method}</span>
                            {truncateJSON(data).text}
                          </summary>
                          <code className="code-left-align">
                            <pre id={`session-method-result-${index}`}>
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </code>
                        </details>
                      ),
                    )
                  ) : (
                    <p>No session method calls</p>
                  )}
                </div>
              </div>

              {/* Session Changes */}
              <div className="results-section">
                <h3>
                  <span className="code-method">wallet_sessionChanged</span>{' '}
                </h3>
                <div className="notification-container">
                  {walletSessionChangedHistory.length > 0 ? (
                    walletSessionChangedHistory.map(
                      ({ timestamp, data }, index) => (
                        <details key={timestamp}>
                          <summary className="result-summary">
                            <span className="timestamp">
                              {new Date(timestamp).toLocaleString()}
                            </span>
                            {truncateJSON(data).text}
                          </summary>
                          <code className="code-left-align">
                            <pre id={`wallet-session-changed-result-${index}`}>
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </code>
                        </details>
                      ),
                    )
                  ) : (
                    <p>No session changes detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="session-divider" />
        </div>
      </section>

      {isConnected && (
        <>
          <div className={styles.networkSelection}>
            <h3>Select Networks</h3>
            {(Object.entries(FEATURED_NETWORKS) as [NetworkId, string][]).map(
              ([chainId, networkName]) => (
                <label key={chainId}>
                  <input
                    type="checkbox"
                    checked={selectedChains[chainId] ?? false}
                    onChange={(e) =>
                      setSelectedChains((prev) => ({
                        ...prev,
                        [chainId]: e.target.checked,
                      }))
                    }
                    disabled={isConnected}
                  />
                  {networkName}
                </label>
              ),
            )}
          </div>
          <div className={styles.accountsGrid}>
            {accountInfo.map((info) => (
              <div key={info.sessionId} className={styles.accountCard}>
                <h3>{FEATURED_NETWORKS[info.chainId]}</h3>
                <div className={styles.address}>Address: {info.account}</div>
                <div className={styles.balance}>
                  Balance: {info.balance} Wei
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.button}
            onClick={terminateConnection}
            disabled={isLoading}
          >
            {isLoading ? 'Terminating...' : 'Terminate All Sessions'}
          </button>

          <div className={styles.sessionHistory}>
            <h3>Session Method History</h3>
            {sessionMethodHistory.map((entry) => (
              <details key={entry.timestamp} className={styles.methodEntry}>
                <summary>
                  {new Date(entry.timestamp).toLocaleString()} - {entry.method}
                </summary>
                <pre>{JSON.stringify(entry.data, null, 2)}</pre>
              </details>
            ))}
          </div>
        </>
      )}
      {currentSession?.sessionScopes && isConnected && (
        <section>
          <div>
            <div className="scope-header">
              <h2>Connected Scopes</h2>
              <button onClick={handleClearInvokeResults}>Clear Results</button>
            </div>
            <button
              onClick={handleInvokeAllMethods}
              disabled={Object.keys(selectedMethods).length === 0}
              className="invoke-all-button"
            >
              Invoke All Selected Methods
            </button>
            <div className="scopes-grid">
              {Object.entries(currentSession.sessionScopes).map(
                ([scope, details]: [string, any]) => (
                  <div
                    data-testid={`scope-card-${scope}`}
                    key={scope}
                    className="scope-card"
                  >
                    <h3
                      title={
                        FEATURED_NETWORKS[
                          scope as keyof typeof FEATURED_NETWORKS
                        ]
                          ? `${
                              FEATURED_NETWORKS[
                                scope as keyof typeof FEATURED_NETWORKS
                              ]
                            } (${scope})`
                          : scope
                      }
                      className="scope-card-title"
                    >
                      {FEATURED_NETWORKS[
                        scope as keyof typeof FEATURED_NETWORKS
                      ]
                        ? `${
                            FEATURED_NETWORKS[
                              scope as keyof typeof FEATURED_NETWORKS
                            ]
                          } (${scope})`
                        : scope}
                    </h3>

                    <select
                      className="accounts-select"
                      value={selectedAccounts[scope] ?? ''}
                      onChange={(evt) => {
                        const newAddress =
                          (evt.target.value as CaipAccountId) ?? '';
                        setSelectedAccounts((prev) => ({
                          ...prev,
                          [scope]: newAddress,
                        }));

                        const currentMethod = selectedMethods[scope];
                        if (currentMethod) {
                          const example = metamaskOpenrpcDocument?.methods.find(
                            (method) =>
                              (method as MethodObject).name === currentMethod,
                          );

                          if (example) {
                            let exampleParams: Json = openRPCExampleToJSON(
                              example as MethodObject,
                            );

                            exampleParams = injectParams(
                              currentMethod,
                              exampleParams,
                              newAddress,
                              scope as CaipChainId,
                            );

                            const updatedRequest = {
                              method: 'wallet_invokeMethod',
                              params: {
                                scope,
                                request: exampleParams,
                              },
                            };

                            setInvokeMethodRequests((prev) => ({
                              ...prev,
                              [scope]: JSON.stringify(updatedRequest, null, 2),
                            }));
                          }
                        }
                      }}
                    >
                      <option value="">Select an account</option>
                      {(details.accounts ?? []).map(
                        (account: CaipAccountId) => {
                          const { address } = parseCaipAccountId(account);
                          return (
                            <option
                              data-testid={`${account}-option`}
                              key={address}
                              value={account}
                            >
                              {address}
                            </option>
                          );
                        },
                      )}
                    </select>

                    <select
                      data-testid={`${scope}-select`}
                      value={selectedMethods[scope] ?? ''}
                      onChange={(evt) =>
                        handleMethodSelect(evt, scope as CaipChainId)
                      }
                    >
                      <option value="">Select a method</option>
                      {details.methods.map((method: string) => (
                        <option
                          data-testid={`${scope}-${method}-option`}
                          key={method}
                          value={method}
                        >
                          {method}
                        </option>
                      ))}
                    </select>

                    <details className="collapsible-section">
                      <summary>Invoke Method Request</summary>
                      <div className="collapsible-content">
                        <textarea
                          data-testid={`${scope}-collapsible-content-textarea`}
                          value={invokeMethodRequests[scope] ?? ''}
                          onChange={(evt) =>
                            setInvokeMethodRequests((prev) => ({
                              ...prev,
                              [scope]: evt.target.value,
                            }))
                          }
                          rows={5}
                          cols={50}
                        />
                      </div>
                    </details>

                    <button
                      data-testid={`invoke-method-${scope}-btn`}
                      onClick={async () => {
                        const method = selectedMethods[scope];
                        if (method) {
                          await handleInvokeMethod(
                            scope as CaipChainId,
                            method,
                          );
                        }
                      }}
                    >
                      Invoke Method
                    </button>

                    {Object.entries(invokeMethodResults[scope] ?? {}).map(
                      ([method, results]) => {
                        return results.map(({ result, request }, index) => {
                          const { text, truncated } = truncateJSON(result, 150);
                          return truncated ? (
                            <details
                              key={`${method}-${index}`}
                              className="collapsible-section"
                            >
                              <summary>
                                <span className="result-method">{method}</span>
                                <div className="result-params">
                                  Params: {JSON.stringify(request.params)}
                                </div>
                                <span className="result-preview">{text}</span>
                              </summary>
                              <div className="collapsible-content">
                                <code className="code-left-align">
                                  <pre
                                    id={`invoke-method-${scope}-${method}-result-${index}`}
                                  >
                                    {JSON.stringify(result, null, 2)}
                                  </pre>
                                </code>
                              </div>
                            </details>
                          ) : (
                            <div
                              key={`${method}-${index}`}
                              className="result-item-small"
                            >
                              <div className="result-header">
                                <span className="result-method">{method}</span>
                                <div className="result-params">
                                  Params: {JSON.stringify(request.params)}
                                </div>
                              </div>
                              <code className="code-left-align">
                                <pre
                                  id={`invoke-method-${scope}-${method}-result-${index}`}
                                >
                                  {text}
                                </pre>
                              </code>
                            </div>
                          );
                        });
                      },
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}
      <section className="notifications-section">
        <h2>
          Notifications ( <span className="code-method">wallet_notify</span>)
        </h2>
        <div className="notification-container">
          {walletNotifyHistory.length > 0 ? (
            walletNotifyHistory.map(({ timestamp, data }, index) => (
              <details key={timestamp}>
                <summary className="result-summary">
                  <span className="timestamp">
                    {new Date(timestamp).toLocaleString()}
                  </span>
                  {truncateJSON(data).text}
                </summary>
                <code className="code-left-align">
                  <pre id={`wallet-notify-result-${index}`}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </code>
              </details>
            ))
          ) : (
            <p>No notifications received</p>
          )}
        </div>
      </section>
    </div>
  );
}
