import fetch from 'cross-fetch';
import { DEFAULT_SERVER_URL } from './config';
import { CommunicationLayer } from './types/CommunicationLayer';

export interface AnaliticsProps {
  id: string;
  event: unknown;
  originationInfo?: unknown;
  commLayer?: CommunicationLayer;
  sdkVersion?: string;
}

export const SendAnalytics = async (
  parameters: AnaliticsProps,
  sockerServerUrl = DEFAULT_SERVER_URL,
) => {
  const serverUrl = `${sockerServerUrl}debug`;

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

