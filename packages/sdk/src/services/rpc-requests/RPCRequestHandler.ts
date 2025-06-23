let rpcId = 1;

function getNextRpcId() {
  rpcId += 1;
  return rpcId;
}

interface RpcResponse {
  id: number;
  jsonrpc: string;
  result: unknown;
}

// Use native fetch, with fallback check for older environments
const getFetchApi = () => {
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch;
  }

  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch;
  }

  if (typeof global !== 'undefined' && global.fetch) {
    return global.fetch;
  }

  throw new Error(
    'Fetch API not available. Please use Node.js 18+ or a modern browser, or provide a fetch polyfill.',
  );
};

export const rpcRequestHandler = async ({
  rpcEndpoint,
  method,
  sdkInfo,
  params,
}: {
  rpcEndpoint: string;
  sdkInfo: string;
  method: string;
  params: unknown[];
}) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method,
    params,
    id: getNextRpcId(),
  });

  const headers: { [key: string]: string } = {
    // eslint-disable-next-line prettier/prettier
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (rpcEndpoint.includes('infura')) {
    headers['Metamask-Sdk-Info'] = sdkInfo;
  }

  let response;
  try {
    const fetchApi = getFetchApi();
    response = await fetchApi(rpcEndpoint, {
      method: 'POST',
      headers,
      body,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch from RPC: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch from RPC: ${error}`);
    }
  }

  if (!response.ok) {
    throw new Error(`Server responded with a status of ${response.status}`);
  }

  const rpcResponse = (await response.json()) as RpcResponse;
  return rpcResponse.result;
};
