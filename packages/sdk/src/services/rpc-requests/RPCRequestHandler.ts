import crossFetch from 'cross-fetch';

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
    response = await crossFetch(rpcEndpoint, {
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
