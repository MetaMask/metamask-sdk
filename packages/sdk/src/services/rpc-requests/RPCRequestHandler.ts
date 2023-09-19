import crossFetch from 'cross-fetch';

let rpcId = 1;
export const rpcRequestHandler = async ({
  rpcEndpoint,
  method,
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
    id: rpcId,
  });

  // Increment rpcId to have unique id for each request
  rpcId += 1;

  const headers: { [key: string]: string } = {
    // eslint-disable-next-line prettier/prettier
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  // if (rpcEndpoint.includes('infura')) {
  // TODO re-enable once infura allows for custom headers
  // headers['Metamask-Sdk-Info'] = sdkInfo;
  // }

  const response = await crossFetch(rpcEndpoint, {
    method: 'POST',
    headers,
    body,
  });
  const result = await response.json();
  return result;
};
