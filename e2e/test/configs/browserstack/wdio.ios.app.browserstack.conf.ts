import path from 'path';
import * as dotenv from 'dotenv';

import config from './wdio.shared.browserstack.conf';

dotenv.config({ path: path.join(process.cwd(), '.ios.env') });

// ============
// Specs
// ============
// Placeholder in case we want to have android specific features

// ============
// Capabilities
// ============
// For all capabilities please check
// http://appium.io/docs/en/writing-running-appium/caps/#general-capabilities
config.capabilities = [
  {
    // The defaults you need to have in your config
    platformName: 'iOS',
    maxInstances: 1,
    // For W3C the appium capabilities need to have an extension prefix
    // http://appium.io/docs/en/writing-running-appium/caps/
    // This is `appium:` for all Appium Capabilities which can be found here
    'appium:deviceName': 'iPhone 14',
    'appium:platformVersion': '16.0',
    'appium:automationName': 'XCUITest',
    'appium:app': process.env.APP_PATH,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:bundleId': 'io.metamask.MetaMask-QA',
    'appium:udid': process.env.DEVICE_UDID,
    // "appium:xcodeSigningId": "iPhone Developer",
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:language': 'en',
    'appium:fullReset': true,
    // @ts-ignore
    'appium:settings[snapshotMaxDepth]': 62,
    'appium:settings[customSnapshotTimeout]': 50000,
  },
];

exports.config = config;
