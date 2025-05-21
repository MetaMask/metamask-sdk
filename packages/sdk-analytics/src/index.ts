/* eslint-disable no-restricted-globals */
import Analytics from './analytics';

let endpoint: string | undefined;
if (typeof process !== 'undefined' && process.env) {
  endpoint =
    process.env.METAMASK_ANALYTICS_ENDPOINT ??
    process.env.NEXT_PUBLIC_METAMASK_ANALYTICS_ENDPOINT;
}

const METAMASK_ANALYTICS_ENDPOINT: string =
  endpoint ?? 'https://mm-sdk-analytics.api.cx.metamask.io/';

const client = new Analytics(METAMASK_ANALYTICS_ENDPOINT);

export const analytics = client;
