/* eslint-disable no-restricted-globals */
import Analytics from './analytics';

// Cross environment variable for the analytics endpoint
const METAMASK_ANALYTICS_ENDPOINT =
  process.env.METAMASK_ANALYTICS_ENDPOINT ??
  process.env.NEXT_PUBLIC_METAMASK_ANALYTICS_ENDPOINT ??
  'https://mm-sdk-analytics.api.cx.metamask.io/';

const client = new Analytics(METAMASK_ANALYTICS_ENDPOINT);

export const analytics = client;
