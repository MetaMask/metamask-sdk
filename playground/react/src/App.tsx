/* eslint-disable @typescript-eslint/no-misused-promises */
import { MetaMaskOpenRPCDocument } from '@metamask/api-specs';
import type {
  CaipAccountAddress,
  CaipAccountId,
  CaipChainId,
  Json,
} from '@metamask/utils';
import { isCaipAccountId, parseCaipAccountId } from '@metamask/utils';
import type { MethodObject, OpenrpcDocument } from '@open-rpc/meta-schema';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import './App.css';
import DynamicInputs, { INPUT_LABEL_TYPE } from './components/DynamicInputs';
import type { WalletMapEntry } from './components/WalletList';
import WalletList from './components/WalletList';
import {
  injectParams,
  METHODS_REQUIRING_PARAM_INJECTION,
} from './constants/methods';
import { FEATURED_NETWORKS, getNetworkName } from './constants/networks';
import { escapeHtmlId } from './helpers/IdHelpers';
import { openRPCExampleToJSON, truncateJSON } from './helpers/JsonHelpers';
import {
  normalizeMethodParams,
  updateInvokeMethodResults,
  extractRequestParams,
  extractRequestForStorage,
  autoSelectAccountForScope,
  prepareMethodRequest,
} from './helpers/MethodInvocationHelpers';
import { generateSolanaMethodExamples } from './helpers/solana-method-signatures';
import { useSDK } from './sdk';
import { WINDOW_POST_MESSAGE_ID } from './sdk/SDK';

function App() {
  const [caipAccountIds, setCaipAccountIds] = useState<string[]>(['']);
  const [walletMapEntries, setWalletMapEntries] = useState<
    Record<string, WalletMapEntry>
  >({});
  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, string>
  >({});
  const [invokeMethodResults, setInvokeMethodResults] = useState<
    Record<string, Record<string, { result: any; request: any }[]>>
  >({});
  const [customScopes, setCustomScopes] = useState<string[]>(['']);
  const [selectedScopes, setSelectedScopes] = useState<
    Record<CaipChainId, boolean>
  >({
    [FEATURED_NETWORKS['Ethereum Mainnet']]: true,
    [FEATURED_NETWORKS['Linea Mainnet']]: true,
    [FEATURED_NETWORKS['Arbitrum One']]: false,
    [FEATURED_NETWORKS['Avalanche Network C-Chain']]: false,
    [FEATURED_NETWORKS['BNB Chain']]: false,
    [FEATURED_NETWORKS['OP Mainnet']]: false,
    [FEATURED_NETWORKS['Polygon Mainnet']]: false,
    [FEATURED_NETWORKS['zkSync Era Mainnet']]: false,
    [FEATURED_NETWORKS['Base Mainnet']]: false,
    [FEATURED_NETWORKS.Localhost]: false,
    [FEATURED_NETWORKS['Solana Mainnet']]: false,
  });
  const [extensionId, setExtensionId] = useState<string>('');
  const [invokeMethodRequests, setInvokeMethodRequests] = useState<
    Record<string, string>
  >({});
  const [metamaskOpenrpcDocument, setMetamaskOpenrpcDocument] =
    useState<OpenrpcDocument>();
  const [selectedAccounts, setSelectedAccounts] = useState<
    Record<string, CaipAccountId | null>
  >({});
  const [walletSessionChangedHistory, setWalletSessionChangedHistory] =
    useState<{ timestamp: number; data: any }[]>([]);
  const [walletNotifyHistory, setWalletNotifyHistory] = useState<
    { timestamp: number; data: any }[]
  >([]);
  const [sessionMethodHistory, setSessionMethodHistory] = useState<
    { timestamp: number; method: string; data: any }[]
  >([]);
  const [consoleErrorHistory, setConsoleErrorHistory] = useState<
    {
      timestamp: number;
      uniqueKey?: string;
      error: any;
      stack: string | undefined;
      fullErrorText: string;
    }[]
  >([]);
  const [copiedNamespace, setCopiedNamespace] = useState<string | null>(null);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);
  const originalConsoleError = useRef<typeof console.error | null>(null);

  const setInitialMethodsAndAccounts = (currentSession: any) => {
    const initialSelectedMethods: Record<string, string> = {};
    const initialSelectedAccounts: Record<string, CaipAccountId> = {};
    const initialInvokeMethodRequests: Record<string, string> = {};

    Object.entries(currentSession.sessionScopes).forEach(
      ([scope, details]: [string, any]) => {
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
          const example = metamaskOpenrpcDocument?.methods.find(
            (method) => (method as MethodObject).name === 'eth_blockNumber',
          );
          const request = openRPCExampleToJSON(example as MethodObject);
          const invokeMethodRequest = getInvokeMethodRequest(request);
          initialInvokeMethodRequests[scope] = JSON.stringify(
            invokeMethodRequest,
            null,
            2,
          );
        }
      },
    );
    setInvokeMethodRequests(initialInvokeMethodRequests);
    setSelectedMethods(initialSelectedMethods);
    setSelectedAccounts(initialSelectedAccounts);
  };

  const setSelectedScopesFromSession = (sessionScopes: any) => {
    const connectedScopes = Object.keys(sessionScopes || {});
    setSelectedScopes(() => {
      const newScopes: Record<string, boolean> = {};
      connectedScopes.forEach((scope) => {
        newScopes[scope] = true;
      });
      return newScopes;
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
        setSelectedScopesFromSession(notification.params.sessionScopes);
        setInitialMethodsAndAccounts({
          sessionScopes: notification.params.sessionScopes,
        });
      }
    },
    [
      setWalletSessionChangedHistory,
      setSelectedScopesFromSession,
      setInitialMethodsAndAccounts,
    ],
  );

  const handleNotification = useCallback(
    (notification: any) => {
      setWalletNotifyHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [{ timestamp, data: notification }, ...prev];
      });
    },
    [setWalletNotifyHistory],
  );

  const handleWalletAnnounce = useCallback(
    (ev: Event) => {
      const customEvent = ev as CustomEvent;
      const { targets, rdns } = customEvent.detail.params;
      const announcedId = targets?.find(
        (target: { type: string; value: string }) => target.type === 'caip-348',
      )?.value;
      const newExtensionId =
        rdns === 'io.metamask.flask' && !announcedId
          ? WINDOW_POST_MESSAGE_ID
          : announcedId;
      const newEntry: WalletMapEntry = {
        params: {
          ...customEvent.detail.params,
          extensionId: newExtensionId,
        },
      };
      setExtensionId(newExtensionId);
      setWalletMapEntries((prev) => ({
        ...prev,
        [customEvent.detail.params.uuid]: newEntry,
      }));
    },
    [setExtensionId, setWalletMapEntries],
  );

  const {
    isConnected: isExternallyConnectableConnected,
    currentSession,
    connect,
    disconnect,
    createSession,
    revokeSession,
    getSession,
    invokeMethod,
    extensionId: loadedExtensionId,
  } = useSDK({
    onSessionChanged: handleSessionChangedNotification,
    onWalletNotify: handleNotification,
    onWalletAnnounce: handleWalletAnnounce,
  });

  useEffect(() => {
    setExtensionId(loadedExtensionId);
  }, [loadedExtensionId]);

  const handleConnectClick = async () => {
    if (extensionId) {
      try {
        await connect(extensionId);
      } catch (error) {
        console.error('Error connecting:', error);
      }
    }
  };

  const handleWalletListClick = useCallback(
    async (newExtensionId: string): Promise<void> => {
      setExtensionId(newExtensionId);
      try {
        await connect(newExtensionId);
      } catch (error) {
        console.error('Error connecting:', error);
      }
    },
    [setExtensionId, handleConnectClick],
  );

  useEffect(() => {
    parseOpenRPCDocument(MetaMaskOpenRPCDocument)
      .then((parsedOpenRPCDocument) => {
        setMetamaskOpenrpcDocument(parsedOpenRPCDocument);
      })
      .catch(() => {
        console.error('Error parsing metamask openrpc document');
      });
  }, []);

  useEffect(() => {
    originalConsoleError.current = console.error;

    console.error = (...args) => {
      if (originalConsoleError.current) {
        originalConsoleError.current.apply(console, args);
      }

      setConsoleErrorHistory((prev) => {
        const timestamp = Date.now();

        const fullErrorText = args
          .map((arg) => {
            if (typeof arg === 'string') {
              return arg;
            }
            if (arg instanceof Error) {
              return String(arg);
            }
            return JSON.stringify(arg);
          })
          .join(' ');

        const errorSummary = fullErrorText
          .substring(0, 20)
          .replace(/\s+/gu, '');
        const uniqueKey = `${timestamp}-${errorSummary}`;

        if (prev.some((entry) => entry.uniqueKey === uniqueKey)) {
          return prev;
        }

        const error = args[0];
        const stack = error instanceof Error ? error.stack : undefined;

        const newEntry = {
          timestamp,
          uniqueKey,
          error,
          stack,
          fullErrorText,
        };
        return [newEntry, ...prev].slice(0, 15);
      });
    };

    return () => {
      if (originalConsoleError.current) {
        console.error = originalConsoleError.current;
      }
    };
  }, []);

  const handleResetState = () => {
    setSelectedMethods({});
    setInvokeMethodResults({});
    setCustomScopes(['']);
    setWalletSessionChangedHistory([]);
    setWalletNotifyHistory([]);
    setSessionMethodHistory([]);
    setConsoleErrorHistory([]);
    setSelectedScopes({
      [FEATURED_NETWORKS['Ethereum Mainnet']]: false,
      [FEATURED_NETWORKS['Linea Mainnet']]: false,
      [FEATURED_NETWORKS['Arbitrum One']]: false,
      [FEATURED_NETWORKS['Avalanche Network C-Chain']]: false,
      [FEATURED_NETWORKS['BNB Chain']]: false,
      [FEATURED_NETWORKS['OP Mainnet']]: false,
      [FEATURED_NETWORKS['Polygon Mainnet']]: false,
      [FEATURED_NETWORKS['zkSync Era Mainnet']]: false,
      [FEATURED_NETWORKS['Base Mainnet']]: false,
      [FEATURED_NETWORKS.Localhost]: false,
      [FEATURED_NETWORKS['Solana Mainnet']]: false,
    });
  };

  useEffect(() => {
    if (!isExternallyConnectableConnected) {
      handleResetState();
    }
  }, [isExternallyConnectableConnected]);

  const handleCreateSession = async () => {
    const selectedScopesArray = [
      ...Object.keys(selectedScopes).filter((scope) => {
        const caipChainId = scope as CaipChainId;
        return selectedScopes[caipChainId];
      }),
      ...customScopes.filter((scope) => scope.length),
    ];

    try {
      const filteredAccountIds = caipAccountIds.filter(
        (addr) => addr.trim() !== '',
      );

      const result = await createSession(
        selectedScopesArray as CaipChainId[],
        filteredAccountIds as CaipAccountId[],
      );
      setSessionMethodHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [
          { timestamp, method: 'wallet_createSession', data: result },
          ...prev,
        ];
      });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleGetSession = async () => {
    try {
      const result = await getSession();
      setSessionMethodHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [
          { timestamp, method: 'wallet_getSession', data: result },
          ...prev,
        ];
      });
    } catch (error) {
      console.error('Error getting session:', error);
    }
  };

  const handleRevokeSession = async () => {
    try {
      const result = await revokeSession();
      setSessionMethodHistory((prev) => {
        const timestamp = Date.now();
        if (prev.some((entry) => entry.timestamp === timestamp)) {
          return prev;
        }
        return [
          { timestamp, method: 'wallet_revokeSession', data: result },
          ...prev,
        ];
      });
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleInvokeMethod = async (
    scope: CaipChainId,
    method: string,
    requestObject?: any,
  ) => {
    console.log(`🔧 handleInvokeMethod called: ${method} on ${scope}`);
    const finalRequestObject =
      requestObject ?? JSON.parse(invokeMethodRequests[scope] ?? '{}');
    console.log(`📋 Request object:`, finalRequestObject);

    try {
      // Extract and normalize parameters
      const params = extractRequestParams(finalRequestObject);
      console.log(`📤 Calling invokeMethod with params:`, params);

      const paramsArray = normalizeMethodParams(method, params);
      console.log(`📤 Normalized params array:`, paramsArray);

      const result = await invokeMethod(scope, {
        method,
        params: paramsArray,
      });

      console.log(`📥 Received result:`, result);

      const request = extractRequestForStorage(finalRequestObject);
      setInvokeMethodResults((prev) => {
        const newResults = updateInvokeMethodResults(
          prev,
          scope,
          method,
          result,
          request,
        );
        console.log(`💾 Updated invoke results:`, newResults);
        return newResults;
      });
    } catch (error) {
      console.error('❌ Error invoking method:', error);

      const request = extractRequestForStorage(finalRequestObject);
      setInvokeMethodResults((prev) => {
        const newResults = updateInvokeMethodResults(
          prev,
          scope,
          method,
          error as Error,
          request,
        );
        console.log(`💾 Updated invoke results (error):`, newResults);
        return newResults;
      });
    }
  };

  const handleInvokeAllMethods = async () => {
    const scopesWithMethods = Object.entries(selectedMethods)
      .filter(([_, method]) => method)
      .map(([scope, method]) => ({ scope, method }));

    await Promise.all(
      scopesWithMethods.map(async ({ scope, method }) => {
        const scopeToInvoke = scope as keyof typeof selectedScopes;
        return handleInvokeMethod(scopeToInvoke, method);
      }),
    );
  };

  /**
   * Handles direct method invocation for E2E testing.
   * Auto-selects the method and invokes it immediately.
   *
   * @param caipChainId - The CAIP chain ID of the scope.
   * @param method - The method to invoke.
   */
  const handleDirectMethodInvoke = async (
    caipChainId: CaipChainId,
    method: string,
  ) => {
    try {
      console.log(`🔄 Direct invoke: ${method} on ${caipChainId}`);

      // Auto-select method first
      setSelectedMethods((prev) => ({
        ...prev,
        [caipChainId]: method,
      }));

      // Ensure we have a selected account for this scope
      const selectedAccount = autoSelectAccountForScope(
        caipChainId,
        selectedAccounts[caipChainId] ?? null,
        currentSession,
        setSelectedAccounts,
      );

      if (!selectedAccount) {
        return; // Error already logged in helper function
      }

      const defaultRequest = prepareMethodRequest(
        method,
        caipChainId,
        selectedAccount,
        metamaskOpenrpcDocument,
        injectParams,
        openRPCExampleToJSON,
        METHODS_REQUIRING_PARAM_INJECTION,
      );

      if (!defaultRequest) {
        return; // Error already logged in helper function
      }

      setInvokeMethodRequests((prev) => ({
        ...prev,
        [caipChainId]: JSON.stringify(defaultRequest, null, 2),
      }));

      console.log(`✅ Request prepared for ${method}:`, defaultRequest);

      console.log(`🚀 Invoking ${method} on ${caipChainId}`);
      console.log(
        `📋 Request for ${caipChainId}:`,
        JSON.stringify(defaultRequest, null, 2),
      );
      await handleInvokeMethod(caipChainId, method, defaultRequest);
      console.log(`✅ Successfully invoked ${method}`);
    } catch (error) {
      console.error(`❌ Error in handleDirectMethodInvoke:`, error);
    }
  };

  useEffect(() => {
    if (currentSession?.sessionScopes) {
      setInitialMethodsAndAccounts(currentSession);
      setSelectedScopesFromSession(currentSession.sessionScopes);
    }
  }, [currentSession]);

  // URL parameter parsing and auto-mode detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoMode = urlParams.get('autoMode') === 'true';
    const preselectMethods = urlParams.get('preselect')?.split(',') ?? [];

    setIsAutoMode(autoMode);

    if (autoMode) {
      document.body.classList.add('auto-mode');
    } else {
      document.body.classList.remove('auto-mode');
    }

    // Auto-populate method selections if in auto mode and session exists
    if (autoMode && currentSession?.sessionScopes) {
      const autoSelectedMethods: Record<string, string> = {};
      const scopeKeys = Object.keys(currentSession.sessionScopes);

      scopeKeys.forEach((scope, index) => {
        const method = preselectMethods[index];
        if (method) {
          autoSelectedMethods[scope] = method;
        }
      });

      if (Object.keys(autoSelectedMethods).length > 0) {
        setSelectedMethods((prev) => ({
          ...prev,
          ...autoSelectedMethods,
        }));
      }
    }
  }, [currentSession]);

  /**
   * Regenerates the invoke method request for a solana chain with the given method and address,
   * and updates the state.
   * @param scope - The CAIP chain ID of the chain the account belongs to.
   * @param address - The address of the account to invoke the method on.
   * @param method - The method to invoke.
   */
  const handleUpdateInvokeMethodSolana = async (
    scope: CaipChainId,
    address: CaipAccountAddress,
    method: string,
  ) => {
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

  /**
   * Handles the selection of an account for a given chain.
   * @param evt - The change event from the select element.
   * @param caipChainId - The CAIP chain ID of the chain the account belongs to.
   */
  const handleAccountSelect = async (
    evt: React.ChangeEvent<HTMLSelectElement>,
    caipChainId: CaipChainId,
  ) => {
    const { value } = evt.target;
    const valueIsCaipAccountId = isCaipAccountId(value);
    const valueToSet = valueIsCaipAccountId ? value : null;

    setSelectedAccounts((prev) => ({
      ...prev,
      [caipChainId]: valueToSet,
    }));

    if (!valueIsCaipAccountId) {
      return;
    }

    if (caipChainId.startsWith('solana:')) {
      const newAddress = parseCaipAccountId(value).address;
      await handleUpdateInvokeMethodSolana(
        caipChainId,
        newAddress,
        selectedMethods[caipChainId] ?? '',
      );
    }

    const currentMethod = selectedMethods[caipChainId];
    if (currentMethod) {
      const example = metamaskOpenrpcDocument?.methods.find(
        (method) => (method as MethodObject).name === currentMethod,
      );

      if (example) {
        let exampleParams: Json = openRPCExampleToJSON(example as MethodObject);

        exampleParams = injectParams(
          currentMethod,
          exampleParams,
          value,
          caipChainId,
        );

        const updatedRequest = {
          method: 'wallet_invokeMethod',
          params: {
            scope: caipChainId,
            request: exampleParams,
          },
        };

        setInvokeMethodRequests((prev) => ({
          ...prev,
          [caipChainId]: JSON.stringify(updatedRequest, null, 2),
        }));
      }
    }
  };

  const handleMethodSelect = async (
    evt: React.ChangeEvent<HTMLSelectElement>,
    scope: CaipChainId,
  ) => {
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
      await handleUpdateInvokeMethodSolana(
        scope,
        parseCaipAccountId(selectedAddress).address,
        selectedMethod,
      );
    } else {
      const example = metamaskOpenrpcDocument?.methods.find(
        (method) => (method as MethodObject).name === selectedMethod,
      );

      if (example) {
        let exampleParams: Json = openRPCExampleToJSON(example as MethodObject);

        if (selectedMethod in METHODS_REQUIRING_PARAM_INJECTION) {
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
    }
  };

  const handleClearInvokeResults = () => {
    setInvokeMethodResults({});
  };

  useEffect(() => {
    if (!isExternallyConnectableConnected) {
      handleResetState();
    }
  }, [isExternallyConnectableConnected]);

  const copyNamespaceToClipboard = async (namespace: string) => {
    try {
      await navigator.clipboard.writeText(namespace);
      setCopiedNamespace(namespace);
      setTimeout(() => setCopiedNamespace(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatErrorBase = (
    errorObj: any,
    fullText?: string,
    stringify: (obj: Json) => string = (obj) => JSON.stringify(obj),
  ): string => {
    if (fullText) {
      return fullText;
    }
    if (typeof errorObj === 'string') {
      return errorObj;
    }
    if (errorObj instanceof Error) {
      return String(errorObj);
    }
    return stringify(errorObj);
  };

  const formatError = (
    errorObj: any,
    _errStack?: string,
    fullText?: string,
  ): string => {
    return formatErrorBase(errorObj, fullText);
  };

  const formatErrorContent = (
    errorObj: any,
    errStack?: string,
    fullText?: string,
  ): string => {
    if (errorObj instanceof Error && errStack) {
      return `${String(errorObj)}\n\n${errStack}`;
    }
    return formatErrorBase(errorObj, fullText, (obj) =>
      JSON.stringify(obj, null, 2),
    );
  };

  return (
    <div className="App">
      <h1>MetaMask MultiChain API Test Dapp</h1>
      <div className="app-subtitle">
        <i>Requires MetaMask Extension with CAIP Multichain API Enabled</i>
        {isAutoMode && (
          <div className="auto-mode-indicator">
            <strong>🤖 E2E Testing Mode Active</strong>
          </div>
        )}
      </div>
      <section>
        <div>
          <label>
            Extension ID:
            <input
              type="text"
              placeholder="Enter extension ID"
              value={extensionId}
              onChange={(evt) => setExtensionId(evt.target.value)}
              disabled={isExternallyConnectableConnected}
              data-testid="extension-id-input"
              id="extension-id-input"
            />
            <button
              onClick={handleConnectClick}
              disabled={isExternallyConnectableConnected}
              data-testid="connect-button"
              id="connect-button"
            >
              Connect
            </button>
          </label>
        </div>
        <div className="connection-status">
          <span
            className={`status-indicator ${
              isExternallyConnectableConnected
                ? 'status-connected'
                : 'status-disconnected'
            }`}
          ></span>
          <span>
            {isExternallyConnectableConnected
              ? 'Ready to Connect'
              : 'Not ready to connect'}
          </span>
          <button
            onClick={() => {
              disconnect();
              setExtensionId('');
              localStorage.removeItem('extensionId');
            }}
            data-testid="clear-extension-button"
            id="clear-extension-button"
          >
            Clear Extension ID
          </button>
          <button
            onClick={() => {
              // For postMessage, we don't need an extensionId, so directly connect
              connect(WINDOW_POST_MESSAGE_ID).catch((error) => {
                console.error('Auto-connect via postMessage failed:', error);
              });
            }}
            disabled={isExternallyConnectableConnected}
            data-testid="auto-connect-postmessage-button"
            id="auto-connect-postmessage-button"
          >
            Auto Connect via postMessage
          </button>
        </div>
      </section>
      <section>
        <div>
          <h2>Detected Wallets</h2>
        </div>
        <div>
          <WalletList
            wallets={walletMapEntries}
            handleClick={handleWalletListClick}
            connectedExtensionId={
              isExternallyConnectableConnected ? extensionId : ''
            }
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
                  ([networkName, chainId]) => (
                    <label key={chainId} className="network-label">
                      <input
                        type="checkbox"
                        name={chainId}
                        checked={
                          selectedScopes[chainId as CaipChainId] ?? false
                        }
                        onChange={(evt) =>
                          setSelectedScopes((prev) => ({
                            ...prev,
                            [chainId]: evt.target.checked,
                          }))
                        }
                        disabled={!isExternallyConnectableConnected}
                        data-testid={`network-checkbox-${escapeHtmlId(
                          chainId,
                        )}`}
                        id={`network-checkbox-${escapeHtmlId(chainId)}`}
                      />{' '}
                      {networkName}
                    </label>
                  ),
                )}

                <div className="convenience-buttons-section">
                  <h4>Convenience Buttons (Copy CaipChainIds to Clipboard)</h4>
                  <div className="namespace-buttons">
                    <button
                      className="namespace-button"
                      onClick={async () => {
                        await copyNamespaceToClipboard(
                          `${FEATURED_NETWORKS['Ethereum Mainnet']}:`,
                        );
                      }}
                      data-testid="copy-ethereum-namespace"
                      id="copy-ethereum-namespace"
                    >
                      <span className="copy-icon">📋</span> Ethereum Mainnet
                      {copiedNamespace ===
                        `${FEATURED_NETWORKS['Ethereum Mainnet']}:` && (
                        <span className="namespace-copied">Copied!</span>
                      )}
                    </button>
                    <button
                      className="namespace-button"
                      onClick={async () => {
                        await copyNamespaceToClipboard(
                          `${FEATURED_NETWORKS['Solana Mainnet']}:`,
                        );
                      }}
                      data-testid="copy-solana-namespace"
                      id="copy-solana-namespace"
                    >
                      <span className="copy-icon">📋</span> Solana Mainnet
                      {copiedNamespace ===
                        `${FEATURED_NETWORKS['Solana Mainnet']}:` && (
                        <span className="namespace-copied">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <DynamicInputs
                    inputArray={customScopes}
                    setInputArray={setCustomScopes}
                    label={INPUT_LABEL_TYPE.SCOPE}
                  />
                </div>
                <div>
                  <DynamicInputs
                    inputArray={caipAccountIds}
                    setInputArray={setCaipAccountIds}
                    label={INPUT_LABEL_TYPE.CAIP_ACCOUNT_ID}
                  />
                </div>
                <div className="session-lifecycle-buttons">
                  <button
                    id="create-session-btn"
                    onClick={handleCreateSession}
                    disabled={!isExternallyConnectableConnected}
                    data-testid="create-session-btn"
                  >
                    <span className="code-method">wallet_createSession</span>
                  </button>
                  <button
                    id="get-session-btn"
                    onClick={handleGetSession}
                    disabled={!isExternallyConnectableConnected}
                    data-testid="get-session-btn"
                  >
                    <span className="code-method">wallet_getSession</span>
                  </button>
                  <button
                    id="revoke-session-btn"
                    onClick={handleRevokeSession}
                    disabled={!isExternallyConnectableConnected}
                    data-testid="revoke-session-btn"
                  >
                    <span className="code-method">wallet_revokeSession</span>
                  </button>
                </div>
              </div>

              {currentSession && (
                <div className="session-info">
                  <h3>Connected Accounts</h3>
                  <ul
                    className="connection-list"
                    data-testid="connected-accounts-list"
                  >
                    {Object.values(currentSession.sessionScopes ?? {})
                      .flatMap((scope: any) => scope.accounts ?? [])
                      .map(
                        (account: CaipAccountId) =>
                          parseCaipAccountId(account).address,
                      )
                      .filter((address: string) => address !== '')
                      .filter(
                        (address: string, index: number, array: string[]) =>
                          array.indexOf(address) === index,
                      )
                      .map((address: string) => (
                        <li key={address}>{address}</li>
                      )) || <li>No accounts connected</li>}
                  </ul>

                  <h3>Connected Chains</h3>
                  <ul
                    className="connection-list"
                    data-testid="connected-chains-list"
                  >
                    {Object.keys(currentSession.sessionScopes ?? {}).map(
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
                        <details
                          key={timestamp}
                          id={`session-method-details-${index}`}
                        >
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
                        <details
                          key={timestamp}
                          id={`wallet-session-changed-${index}`}
                        >
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

              <div className="results-section">
                <h3>
                  <span className="code-method">Console Errors</span>{' '}
                </h3>
                <div className="notification-container">
                  {consoleErrorHistory.length > 0 ? (
                    consoleErrorHistory.map(
                      ({ timestamp, error, stack, fullErrorText }, index) => {
                        const displayError = formatError(
                          error,
                          stack,
                          fullErrorText,
                        );
                        const errorContent = formatErrorContent(
                          error,
                          stack,
                          fullErrorText,
                        );

                        return (
                          <details
                            key={timestamp}
                            id={`console-error-details-${index}`}
                          >
                            <summary className="result-summary">
                              <span className="timestamp">
                                {new Date(timestamp).toLocaleString()}
                              </span>
                              <span className="error-message">
                                {displayError}
                              </span>
                            </summary>
                            <code className="code-left-align">
                              <pre id={`console-error-${index}`}>
                                {errorContent}
                              </pre>
                            </code>
                          </details>
                        );
                      },
                    )
                  ) : (
                    <p>No console errors</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="session-divider" />
        </div>
      </section>
      {currentSession?.sessionScopes && isExternallyConnectableConnected && (
        <section>
          <div>
            <div className="scope-header">
              <h2>Connected Scopes</h2>
              <button
                onClick={handleClearInvokeResults}
                data-testid="clear-results-button"
                id="clear-results-button"
              >
                Clear Results
              </button>
            </div>
            <button
              onClick={handleInvokeAllMethods}
              disabled={Object.keys(selectedMethods).length === 0}
              className="invoke-all-button"
              data-testid="invoke-all-methods-button"
              id="invoke-all-methods-button"
            >
              Invoke All Selected Methods
            </button>
            <div className="scopes-grid">
              {Object.entries(currentSession.sessionScopes).map(
                ([scope, details]) => {
                  const caipChainId = scope as CaipChainId;
                  const scopeDetails = details as {
                    accounts: CaipAccountId[];
                    methods: string[];
                  };
                  return (
                    <div
                      data-testid={`scope-card-${escapeHtmlId(caipChainId)}`}
                      key={caipChainId}
                      className="scope-card"
                    >
                      <h3
                        title={`${getNetworkName(
                          caipChainId,
                        )} (${caipChainId})`}
                        className="scope-card-title"
                      >
                        {`${getNetworkName(caipChainId)} (${caipChainId})`}
                      </h3>

                      <select
                        className="accounts-select"
                        value={selectedAccounts[caipChainId] ?? ''}
                        onChange={async (evt) => {
                          await handleAccountSelect(evt, caipChainId);
                        }}
                        data-testid={`accounts-select-${escapeHtmlId(
                          caipChainId,
                        )}`}
                        id={`accounts-select-${escapeHtmlId(caipChainId)}`}
                      >
                        <option value="">Select an account</option>
                        {(scopeDetails.accounts ?? []).map(
                          (account: CaipAccountId) => {
                            const { address } = parseCaipAccountId(account);
                            return (
                              <option
                                data-testid={`${escapeHtmlId(
                                  String(account),
                                )}-option`}
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
                        data-testid={`${escapeHtmlId(caipChainId)}-select`}
                        value={selectedMethods[caipChainId] ?? ''}
                        onChange={async (evt) => {
                          await handleMethodSelect(evt, caipChainId);
                        }}
                        id={`method-select-${escapeHtmlId(caipChainId)}`}
                      >
                        <option value="">Select a method</option>
                        {(scopeDetails.methods ?? []).map((method: string) => (
                          <option
                            data-testid={`${escapeHtmlId(
                              caipChainId,
                            )}-${method}-option`}
                            key={method}
                            value={method}
                          >
                            {method}
                          </option>
                        ))}
                      </select>

                      {/* Direct method buttons for E2E testing */}
                      <div
                        className="direct-method-buttons"
                        data-testid={`direct-methods-${escapeHtmlId(
                          caipChainId,
                        )}`}
                      >
                        {(scopeDetails.methods ?? []).map((method: string) => (
                          <button
                            key={method}
                            className="direct-method-btn"
                            data-testid={`direct-invoke-${escapeHtmlId(
                              caipChainId,
                            )}-${method}`}
                            id={`direct-invoke-${escapeHtmlId(
                              caipChainId,
                            )}-${method}`}
                            onClick={async () => {
                              await handleDirectMethodInvoke(
                                caipChainId,
                                method,
                              );
                            }}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      <details
                        className="collapsible-section"
                        data-testid={`invoke-method-details-${escapeHtmlId(
                          caipChainId,
                        )}`}
                        id={`invoke-method-details-${escapeHtmlId(
                          caipChainId,
                        )}`}
                      >
                        <summary>Invoke Method Request</summary>
                        <div className="collapsible-content">
                          <textarea
                            data-testid={`${escapeHtmlId(
                              caipChainId,
                            )}-collapsible-content-textarea`}
                            value={invokeMethodRequests[caipChainId] ?? ''}
                            onChange={(evt) =>
                              setInvokeMethodRequests((prev) => ({
                                ...prev,
                                [caipChainId]: evt.target.value,
                              }))
                            }
                            rows={5}
                            cols={50}
                            id={`invoke-method-request-${escapeHtmlId(
                              caipChainId,
                            )}`}
                          />
                        </div>
                      </details>

                      <button
                        data-testid={`invoke-method-${escapeHtmlId(
                          caipChainId,
                        )}-btn`}
                        onClick={async () => {
                          const method = selectedMethods[caipChainId];
                          if (method) {
                            await handleInvokeMethod(caipChainId, method);
                          }
                        }}
                        id={`invoke-method-${escapeHtmlId(caipChainId)}-btn`}
                        disabled={
                          !selectedMethods[caipChainId] ||
                          !invokeMethodRequests[caipChainId]
                        }
                      >
                        Invoke Method
                      </button>

                      {Object.entries(
                        invokeMethodResults[caipChainId] ?? {},
                      ).map(([method, results]) => {
                        return results.map(({ result, request }, index) => {
                          const { text, truncated } = truncateJSON(result, 150);
                          return truncated ? (
                            <details
                              key={`${method}-${index}`}
                              className="collapsible-section"
                              data-testid={`method-result-details-${escapeHtmlId(
                                caipChainId,
                              )}-${method}-${index}`}
                              id={`method-result-details-${escapeHtmlId(
                                caipChainId,
                              )}-${method}-${index}`}
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
                                    id={`invoke-method-${escapeHtmlId(
                                      caipChainId,
                                    )}-${method}-result-${index}`}
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
                              data-testid={`method-result-item-${escapeHtmlId(
                                caipChainId,
                              )}-${method}-${index}`}
                              id={`method-result-item-${escapeHtmlId(
                                caipChainId,
                              )}-${method}-${index}`}
                            >
                              <div className="result-header">
                                <span className="result-method">{method}</span>
                                <div className="result-params">
                                  Params: {JSON.stringify(request.params)}
                                </div>
                              </div>
                              <code className="code-left-align">
                                <pre
                                  id={`invoke-method-${escapeHtmlId(
                                    caipChainId,
                                  )}-${method}-result-${index}`}
                                >
                                  {text}
                                </pre>
                              </code>
                            </div>
                          );
                        });
                      })}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>
      )}
      <section className="notifications-section">
        <h2>
          Notifications ( <span className="code-method">wallet_notify</span>)
        </h2>
        <div
          className="notification-container"
          data-testid="wallet-notify-container"
        >
          {walletNotifyHistory.length > 0 ? (
            walletNotifyHistory.map(({ timestamp, data }, index) => (
              <details
                key={timestamp}
                data-testid={`wallet-notify-details-${index}`}
                id={`wallet-notify-details-${index}`}
              >
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

export default App;
