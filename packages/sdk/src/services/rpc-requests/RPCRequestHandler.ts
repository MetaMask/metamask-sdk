import crossFetch from 'cross-fetch';

let rpcId = 1;
export const rpcRequestHandler = async ({
  rpcEndpoint,
  method,
  params,
}: {
  rpcEndpoint: string;
  method: string;
  params: unknown[];
}) => {
  console.log(`rpcRequestHandler method=${method}`, params);
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method,
    params,
    id: rpcId,
  });

  // Increment rpcId to have unique id for each request
  rpcId += 1;

  const response = await crossFetch(rpcEndpoint, {
    method: 'POST',
    headers: {
      // eslint-disable-next-line prettier/prettier
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });
  const result = await response.json();
  return result;
};
