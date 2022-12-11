import fetch from 'cross-fetch';
import { SOCKET_IO_SERVER } from './Socket';

export type AnaliticsProps = {
  id: string;
  event: unknown;
  originationInfo?: unknown;
  commLayer?: unknown;
  sdkVersion?: string;
};

const SendAnalytics = async (parameters: AnaliticsProps) => {
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
  // TODO error management when request fails
  const text = await response.text();
  return text;
};

export default SendAnalytics;
