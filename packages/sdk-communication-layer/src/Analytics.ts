import { SOCKET_IO_SERVER } from './Socket';

const SendAnalytics = async (parameters) => {
  const serverUrl = `${SOCKET_IO_SERVER}debug`;

  const response = await fetch(serverUrl, {
    method: 'POST',
    headers: {
      // eslint-disable-next-line prettier/prettier
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parameters),
  });
  return JSON.stringify(response.json);
};

export default SendAnalytics;
