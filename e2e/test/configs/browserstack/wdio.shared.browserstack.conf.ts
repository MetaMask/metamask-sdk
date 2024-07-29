import { config } from '../wdio.conf';

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

config.services = (config.services ? config.services : []).concat([
  [
    'browserstack',
    {
      testObservability: true,
      testObservabilityOptions: {
        projectName: 'SDK e2e tests',
        buildName: 'SDK e2e PR regression',
      },
      browserstackLocal: true,
      opts: {
        forceLocal: "true"
      },
    },
  ],
]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
config.commonCapabilities = {
  'bstack:options': {
    buildName: 'SDK e2e PR regression',
    buildIdentifier: '123',
    projectName: 'BrowserStack Sample',
    debug: true,
    networkLogs: true,
    consoleLogs: 'info',
    deviceOrientation: 'portrait',
    screenOrientation: 'locked',
  },
};

// Browserstack credentials
config.user = username;
config.key = accessKey;

export default config;
