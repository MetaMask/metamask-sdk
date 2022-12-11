import fetch from 'cross-fetch';
import { SOCKET_IO_SERVER } from './Socket';

const SendAnalytics = async (parameters) => {
  const serverUrl = `${SOCKET_IO_SERVER}debug`;

  console.debug(`V2 sending analytics`, parameters);
  const response = await fetch(serverUrl, {
    method: 'POST',
    headers: {
      // eslint-disable-next-line prettier/prettier
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  });
  const text = await response.text();
  console.debug(`response:`, text);
  return text;
};

export default SendAnalytics;
