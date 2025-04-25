import Analytics from './analytics';

const client = new Analytics('https://mm-sdk-analytics.api.cx.metamask.io/');

export const analytics = client; // FIXME: use default export

export default client;
