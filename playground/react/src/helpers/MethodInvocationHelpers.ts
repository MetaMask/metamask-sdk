import type { CaipChainId, Json, CaipAccountId } from '@metamask/utils';
import type { MethodObject } from '@open-rpc/meta-schema';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Normalizes parameters for method invocation, ensuring they are always in array format
 * and applying special handling for specific methods.
 *
 * @param method - The method name being invoked.
 * @param params - The raw parameters.
 * @returns Normalized parameters array.
 */
export const normalizeMethodParams = (method: string, params: Json): Json[] => {
  // Ensure params is always an array for the SDK
  let paramsArray = Array.isArray(params) ? params : [params];

  // Special handling for eth_signTypedData_v3/v4: second parameter must be JSON string
  if (
    (method === 'eth_signTypedData_v3' || method === 'eth_signTypedData_v4') &&
    paramsArray.length >= 2
  ) {
    const firstParam = paramsArray[0];
    const secondParam = paramsArray[1];

    if (firstParam !== undefined && secondParam !== undefined) {
      paramsArray = [
        firstParam, // address (string)
        typeof secondParam === 'string'
          ? secondParam
          : JSON.stringify(secondParam), // typed data (JSON string)
      ];
    }
  }

  return paramsArray;
};

/**
 * Updates the invoke method results state in an immutable way.
 *
 * @param previousResults - Previous invoke method results state.
 * @param scope - The scope being updated.
 * @param method - The method being updated.
 * @param result - The result or error to add.
 * @param request - The request that was made.
 * @returns Updated results state.
 */
export const updateInvokeMethodResults = (
  previousResults: Record<
    string,
    Record<string, { result: Json | Error; request: Json }[]>
  >,
  scope: CaipChainId,
  method: string,
  result: Json | Error,
  request: Json,
) => {
  const scopeResults = previousResults[scope] ?? {};
  const methodResults = scopeResults[method] ?? [];
  const newResults = {
    ...previousResults,
    [scope]: {
      ...scopeResults,
      [method]: [...methodResults, { result, request }],
    },
  };

  return newResults;
};

export const extractRequestParams = (finalRequestObject: {
  params: { request: { params: Json } };
}): Json => {
  return finalRequestObject.params.request.params;
};

export const extractRequestForStorage = (finalRequestObject: {
  params: { request: Json };
}): Json => {
  return finalRequestObject.params.request;
};

/**
 * Auto-selects the first available account for a scope if none is currently selected.
 * Updates the provided setter function with the selected account.
 *
 * @param caipChainId - The CAIP chain ID of the scope.
 * @param currentSelectedAccount - The currently selected account for this scope.
 * @param currentSession - The current session object.
 * @param setSelectedAccounts - Function to update the selected accounts state.
 * @returns The selected account or null if none available.
 */
export const autoSelectAccountForScope = (
  caipChainId: CaipChainId,
  currentSelectedAccount: CaipAccountId | null,
  currentSession: any,
  setSelectedAccounts: Dispatch<
    SetStateAction<Record<string, CaipAccountId | null>>
  >,
): CaipAccountId | null => {
  if (currentSelectedAccount) {
    return currentSelectedAccount;
  }

  const scopeDetails = currentSession?.sessionScopes?.[caipChainId];
  if (scopeDetails?.accounts && scopeDetails.accounts.length > 0) {
    const firstAccount = scopeDetails.accounts[0];
    console.log(
      `🔧 Auto-selecting first account for ${caipChainId}: ${String(
        firstAccount,
      )}`,
    );

    setSelectedAccounts((prev) => ({
      ...prev,
      [caipChainId]: firstAccount,
    }));

    return firstAccount;
  }

  console.error(`❌ No accounts available for scope ${caipChainId}`);
  return null;
};

/**
 * Prepares a method request object for invocation.
 *
 * @param method - The method name to invoke.
 * @param caipChainId - The CAIP chain ID.
 * @param selectedAccount - The selected account for this scope.
 * @param metamaskOpenrpcDocument - The MetaMask OpenRPC document.
 * @param injectParams - Function to inject parameters for specific methods.
 * @param openRPCExampleToJSON - Function to convert OpenRPC examples to JSON.
 * @param METHODS_REQUIRING_PARAM_INJECTION - Object containing methods that require parameter injection.
 * @returns The prepared request object or null if method not found.
 */
export const prepareMethodRequest = (
  method: string,
  caipChainId: CaipChainId,
  selectedAccount: CaipAccountId | null,
  metamaskOpenrpcDocument: any,
  injectParams: (
    method: string,
    params: Json,
    account: CaipAccountId,
    scope: CaipChainId,
  ) => Json,
  openRPCExampleToJSON: (methodObj: MethodObject) => Json,
  METHODS_REQUIRING_PARAM_INJECTION: Record<string, boolean>,
): Json | null => {
  const example = metamaskOpenrpcDocument?.methods.find(
    (methodObj: MethodObject) => methodObj.name === method,
  );

  if (!example) {
    console.error(`❌ No example found for method: ${method}`);
    return null;
  }

  let exampleParams: Json = openRPCExampleToJSON(example as MethodObject);

  if (method in METHODS_REQUIRING_PARAM_INJECTION && selectedAccount) {
    exampleParams = injectParams(
      method,
      exampleParams,
      selectedAccount,
      caipChainId,
    );
  }

  return {
    method: 'wallet_invokeMethod',
    params: {
      scope: caipChainId,
      request: exampleParams,
    },
  };
};
