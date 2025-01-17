'use client';

import { MetaMaskOpenRPCDocument } from '@metamask/api-specs';
import {
  FEATURED_NETWORKS,
  injectParams,
  METHODS_REQUIRING_PARAM_INJECTION,
  openRPCExampleToJSON,
  SessionData,
  SessionEventData,
  truncateJSON,
} from '@metamask/multichainapi';
import {
  CaipAccountId,
  CaipChainId,
  Json,
  parseCaipAccountId,
} from '@metamask/utils';
import { MethodObject, OpenrpcDocument } from '@open-rpc/meta-schema';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';
import { useCallback, useEffect, useState } from 'react';
import DynamicInputs, { INPUT_LABEL_TYPE } from '../components/DynamicInputs';
import { useMultichain } from '../hooks/useMultichain';

import styles from '../styles/page.module.css';

type NetworkId = keyof typeof FEATURED_NETWORKS;

interface WalletHistoryEntry {
  timestamp: number;
  data: unknown;
}

interface SessionMethodResult {
  timestamp: number;
  method: string;
  data: unknown;
}

interface InvokeMethodResult {
  result: Json;
  request: Json;
}

interface InvokeMethodRequest {
  method: string;
  params: {
    scope: CaipChainId;
    request: {
      method: string;
      params: Json[];
    };
  };
}

interface ScopeMethodResults {
  [method: string]: InvokeMethodResult[];
}

interface InvokeMethodResults {
  [scope: string]: ScopeMethodResults;
}

const defaultSessionsScopes: Record<NetworkId, boolean> = {
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
};

export default function Page() {
  // State declarations with proper types
  const [addresses, setAddresses] = useState<string[]>([]);
  const [metamaskOpenrpcDocument, setMetamaskOpenrpcDocument] =
    useState<OpenrpcDocument>();
  const [sessionsScopes, setSessionsScopes] = useState<
    Record<NetworkId, boolean>
  >(defaultSessionsScopes);
  const [selectedAccounts, setSelectedAccounts] = useState<
    Record<string, CaipAccountId>
  >({});
  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, string>
  >({});
  // Custom chain IDs that can be added beyond the default networks
  const [customScopes, setCustomScopes] = useState<string[]>(['']);
  const [invokeMethodRequests, setInvokeMethodRequests] = useState<
    Record<string, string>
  >({});
  const [invokeMethodResults, setInvokeMethodResults] =
    useState<InvokeMethodResults>({});
  const [sessionMethodHistory, setSessionMethodHistory] = useState<
    SessionMethodResult[]
  >([]);
  const [walletSessionChangedHistory, setWalletSessionChangedHistory] =
    useState<WalletHistoryEntry[]>([]);
  const [walletNotifyHistory, setWalletNotifyHistory] = useState<
    WalletHistoryEntry[]
  >([]);

  const setInitialMethodsAndAccounts = useCallback(
    (session: SessionData) => {
      const initialSelectedMethods: Record<string, string> = {};
      const initialSelectedAccounts: Record<string, CaipAccountId> = {};

      Object.entries(session.sessionScopes || {}).forEach(
        ([scope, details]) => {
          if (details.accounts?.[0]) {
            initialSelectedAccounts[scope] = details.accounts[0];
          }
          initialSelectedMethods[scope] = 'eth_blockNumber';

          const example = metamaskOpenrpcDocument?.methods.find(
            (method) => (method as MethodObject).name === 'eth_blockNumber',
          );

          if (example) {
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
          }
        },
      );

      setSelectedMethods(initialSelectedMethods);
      setSelectedAccounts(initialSelectedAccounts);
    },
    [metamaskOpenrpcDocument],
  );

  const handleSessionChangedNotification = useCallback(
    (event: SessionEventData) => {
      setWalletSessionChangedHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [{ timestamp, data: event }, ...prev];
      });

      if (event.session?.sessionScopes) {
        // Convert session scopes to boolean record
        const newScopes = Object.keys(event.session.sessionScopes).reduce<
          Record<NetworkId, boolean>
        >(
          (acc, scope) => ({
            ...acc,
            [scope as NetworkId]: true,
          }),
          { ...defaultSessionsScopes },
        );
        setSessionsScopes(newScopes);
        setInitialMethodsAndAccounts(event.session);
      }
    },
    [setInitialMethodsAndAccounts],
  );

  const handleNotification = useCallback((notification: unknown) => {
    console.log('receive wallet notification', notification);
    setWalletNotifyHistory((prev) => {
      const timestamp = Date.now();
      if (prev.some((entry) => entry.timestamp === timestamp)) {
        return prev;
      }
      return [{ timestamp, data: notification }, ...prev];
    });
  }, []);

  const {
    isConnected,
    currentSession,
    connect,
    createSession,
    getSession,
    revokeSession,
    invokeMethod,
  } = useMultichain({
    onSessionChanged: handleSessionChangedNotification,
    onNotification: handleNotification,
  });

  // Initialize OpenRPC document
  useEffect(() => {
    parseOpenRPCDocument(MetaMaskOpenRPCDocument as OpenrpcDocument)
      .then(setMetamaskOpenrpcDocument)
      .catch(() => console.error('Error parsing metamask openrpc document'));
  }, []);

  const handleCreateSession = async () => {
    const selectedChainsArray = Object.entries(sessionsScopes)
      .filter(([_, isSelected]) => isSelected)
      .map(([chainId]) => chainId as NetworkId);

    try {
      const result = await createSession({
        optionalScopes: selectedChainsArray.reduce(
          (acc, _chainId) => ({
            ...acc,
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
      const result = await getSession();
      setSessionMethodHistory((prev) => [
        { timestamp: Date.now(), method: 'wallet_getSession', data: result },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error getting session:', error);
    }
  };

  const handleRevokeSession = async () => {
    try {
      const result = await revokeSession();
      setSessionMethodHistory((prev) => [
        { timestamp: Date.now(), method: 'wallet_revokeSession', data: result },
        ...prev,
      ]);
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleMethodSelect = useCallback(
    (evt: React.ChangeEvent<HTMLSelectElement>, scope: CaipChainId) => {
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

        const defaultRequest: InvokeMethodRequest = {
          method: 'wallet_invokeMethod',
          params: {
            scope,
            request: {
              method: selectedMethod,
              params: Array.isArray(exampleParams) ? exampleParams : [],
            },
          },
        };

        setInvokeMethodRequests((prev) => ({
          ...prev,
          [scope]: JSON.stringify(defaultRequest, null, 2),
        }));
      }
    },
    [metamaskOpenrpcDocument, selectedAccounts],
  );

  const handleInvokeMethod = useCallback(
    async (scope: CaipChainId, method: string) => {
      try {
        const requestString = invokeMethodRequests[scope];
        if (!requestString) return;

        const requestObject = JSON.parse(requestString) as InvokeMethodRequest;
        const result = await invokeMethod({
          scope,
          request: {
            method,
            params: requestObject.params.request.params,
          },
        });

        setInvokeMethodResults((prev) => ({
          ...prev,
          [scope]: {
            ...(prev[scope] ?? {}),
            [method]: [
              ...(prev[scope]?.[method] ?? []),
              {
                result: result as Json,
                request: requestObject.params.request,
              },
            ],
          },
        }));
      } catch (error) {
        console.error('Error invoking method:', error);
      }
    },
    [invokeMethod, invokeMethodRequests],
  );

  const handleInvokeAllMethods = useCallback(async () => {
    console.debug('[Wallet] Invoking all methods');
    const scopesWithMethods = Object.entries(selectedMethods)
      .filter(([_, method]) => method)
      .map(([scope, method]) => ({ scope, method }));

    await Promise.all(
      scopesWithMethods.map(({ scope, method }) =>
        handleInvokeMethod(scope as CaipChainId, method),
      ),
    );
  }, [selectedMethods, handleInvokeMethod]);

  const handleClearInvokeResults = () => {
    setInvokeMethodResults({});
  };

  return (
    <div className={styles.container}>
      <h1>MetaMask MultiChain API Test Dapp</h1>

      {!isConnected && (
        <section>
          <button
            onClick={() =>
              connect({ extensionId: 'nfdjnfhlblppdgdplngdjgpifllaamoc' })
            }
          >
            Connect
          </button>
        </section>
      )}

      <section>
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
                      checked={sessionsScopes[chainId as NetworkId]}
                      onChange={(evt) =>
                        setSessionsScopes((prev) => ({
                          ...prev,
                          [chainId]: evt.target.checked,
                        }))
                      }
                      disabled={!isConnected}
                    />
                    {networkName}
                  </label>
                ),
              )}

              <DynamicInputs
                inputArray={customScopes}
                setInputArray={setCustomScopes}
                label={INPUT_LABEL_TYPE.SCOPE}
              />

              <DynamicInputs
                inputArray={addresses.length > 0 ? addresses : ['']}
                setInputArray={setAddresses}
                label={INPUT_LABEL_TYPE.ADDRESS}
              />

              <div className="session-lifecycle-buttons">
                <button onClick={handleCreateSession} disabled={!isConnected}>
                  <span className="code-method">wallet_createSession</span>
                </button>
                <button onClick={handleGetSession} disabled={!isConnected}>
                  <span className="code-method">wallet_getSession</span>
                </button>
                <button onClick={handleRevokeSession} disabled={!isConnected}>
                  <span className="code-method">wallet_revokeSession</span>
                </button>
              </div>
            </div>

            {currentSession && (
              <div className="session-info">
                <h3>Connected Accounts</h3>
                <ul className="connection-list">
                  {Object.values(currentSession.sessionScopes || {})
                    .flatMap((scope) => scope.accounts ?? [])
                    .map((account) => parseCaipAccountId(account).address)
                    .filter(Boolean)
                    .filter(
                      (address, index, array) =>
                        array.indexOf(address) === index,
                    )
                    .map((address) => (
                      <li key={address}>{address}</li>
                    ))}
                </ul>

                <h3>Connected Chains</h3>
                <ul className="connection-list">
                  {Object.keys(currentSession.sessionScopes || {}).map(
                    (chain) => (
                      <li key={chain}>{chain}</li>
                    ),
                  )}
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
      </section>

      {/* Method invocation section */}
      {currentSession?.sessionScopes && isConnected && (
        <section>
          <div className="method-invocation">
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
                ([scope, details]) => (
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
                      {(details.accounts ?? []).map((account) => {
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
                      })}
                    </select>

                    <select
                      data-testid={`${scope}-select`}
                      value={selectedMethods[scope] ?? ''}
                      onChange={(evt) =>
                        handleMethodSelect(evt, scope as CaipChainId)
                      }
                    >
                      <option value="">Select a method</option>
                      {details.methods?.map((method: string) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>

                    <details className="collapsible-section">
                      <summary>Invoke Method Request</summary>
                      <div className="collapsible-content">
                        <textarea
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

                    <div className="method-results">
                      {invokeMethodResults[scope] &&
                        Object.entries(invokeMethodResults[scope]).map(
                          ([method, results]) => {
                            return results.map(({ result, request }, index) => {
                              const { text, truncated } = truncateJSON(
                                result,
                                150,
                              );
                              return truncated ? (
                                <details
                                  key={`${method}-${index}`}
                                  className="collapsible-section"
                                >
                                  <summary>
                                    <span className="result-method">
                                      {method}
                                    </span>
                                    <div className="result-params">
                                      Params: {JSON.stringify(request)}
                                    </div>
                                    <span className="result-preview">
                                      {text}
                                    </span>
                                  </summary>
                                  <div className="collapsible-content">
                                    <code className="code-left-align">
                                      <pre>
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
                                    <span className="result-method">
                                      {method}
                                    </span>
                                    <div className="result-params">
                                      Params: {JSON.stringify(request)}
                                    </div>
                                  </div>
                                  <code className="code-left-align">
                                    <pre>{text}</pre>
                                  </code>
                                </div>
                              );
                            });
                          },
                        )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* Notifications section */}
      <section className="notifications-section">
        <h2>
          Notifications ( <span className="code-method">wallet_notify</span>)
        </h2>
        <div className="notification-container">
          {walletNotifyHistory.map(({ timestamp, data }, _index) => (
            <details key={timestamp}>
              <summary className="result-summary">
                <span className="timestamp">
                  {new Date(timestamp).toLocaleString()}
                </span>
                {truncateJSON(data).text}
              </summary>
              <code className="code-left-align">
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </code>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
