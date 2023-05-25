import crossFetch from 'cross-fetch';
import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';

export interface AnaliticsProps {
  id: string;
  event: unknown;
  originationInfo?: unknown;
  commLayer?: CommunicationLayerPreference;
  sdkVersion?: string;
  commLayerVersion: string;
  walletVersion?: string;
}

export const SendAnalytics = async (
  parameters: AnaliticsProps,
  socketServerUrl: string,
) => {
  const serverUrl = socketServerUrl.endsWith('/')
    ? `${socketServerUrl}debug`
    : `${socketServerUrl}/debug`;
  const body = JSON.stringify(parameters);

  const response = await crossFetch(serverUrl, {
    method: 'POST',
    headers: {
      // eslint-disable-next-line prettier/prettier
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });

  // TODO error management when request fails
  const text = await response.text();
  return text;
};
