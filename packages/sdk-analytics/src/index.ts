import { AnalyticsClient } from './client';

// const baseUrl = 'https://mm-sdk-analytics.dev-api.cx.metamask.io/';
const baseUrl = 'http://127.0.0.1:8000';

const client = new AnalyticsClient(baseUrl);

export const analytics = client;

export default client;