import path from 'path';
import * as dotenv from 'dotenv';
import type { Capabilities } from '@wdio/types';
// const allure = require('allure-commandline');

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;

dotenv.config({ path: path.join(process.cwd(), '.dapps.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.ios.env') });

export const config: WebdriverIO.Config = {
  runner: 'local',
//   capabilities: [],

//   hostname: 'hub.browserstack.com',
  services: [
    [
      'browserstack',
      {
        testObservability: false,
        testObservabilityOptions: {
          projectName: 'SDK e2e tests',
          buildName: 'SDK e2e PR regression',
        },
        browserstackLocal: true,
        'browserstack.networkLogs': true,
        app: 'bs://34e933745063a857aa10486bef3df5a235864fbe',
        buildIdentifier: "123123123",
        opts: {
          forceLocal: 'true',
        },
      },
    ],
    'intercept',
  ],
  // @ts-ignore
  commonCapabilities: {
    'bstack:options': {
        projectName: 'BrowserStack Sample',
        buildName: 'SDK e2e PR regression',
        sessionName: 'SDK e2e PR regression Session',
        debug: true,
        networkLogs: true,
        consoleLogs: 'debug',
        deviceOrientation: 'portrait',
        screenOrientation: 'locked',
    },
  },
  capabilities: [
    {
      'appium:autoLaunch': false,
      'appium:bundleId': 'io.metamask.MetaMask-QA',
      // 'appium:waitForQuiescence': true,
      'appium:noReset': false,
      'appium:automationName': 'XCUITest',
      'appium:settings[snapshotMaxDepth]': 62,
      'appium:settings[customSnapshotTimeout]': 50000,
      'appium:language': 'en',
      // 'appium:processArguments': {
      //   args: ['-fixtureServerPort', '12345']
      // },
      'bstack:options': {
        deviceName: 'iPhone 15 Pro Max',
        platformVersion: '17.3',
        platformName: 'ios',
        "networkLogs" : "true",
      }
    } as Capabilities.AppiumXCUITestCapabilities
  ],
    user: username,
    key: accessKey,

  // specs: ['../../specs/*.spec.ts'],
  suites: {
    js_sdk: ['../../specs/js_sdk.spec.ts'],
    android_sdk: ['../../specs/android_sdk.spec.ts'],
    // Development suite that uses fixtures
    development: ['../specs/fixture_reference.ts'],
  },
  mochaOpts: {
    timeout: 360000,
  },
  exclude: [
    // 'path/to/excluded/files'
  ],
  logLevel: 'debug',

  bail: 0,

  baseUrl: '',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',

  // outputDir: 'logs',

  maxInstances: 1,

  reporters: ['spec', ['allure', { outputDir: 'allure-results' }]],

  /*
  // If you are using Cucumber you need to specify the location of your step definitions.
  onComplete() {
    const reportError = new Error('Could not generate Allure report');
    const generation = allure(['generate', 'allure-results', '--clean']);
    return new Promise<void>((resolve, reject) => {
      const generationTimeout = setTimeout(() => reject(reportError), 5000);

      generation.on('exit', (exitCode: number) => {
        clearTimeout(generationTimeout);

        if (exitCode !== 0) {
          return reject(reportError);
        }

        console.log('Allure report successfully generated');
        return resolve();
      });
    });
  },*/
};
