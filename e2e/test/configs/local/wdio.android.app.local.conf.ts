import path from 'path';
import * as dotenv from 'dotenv';

import config from './wdio.shared.local.appium.conf';

dotenv.config({ path: path.join(process.cwd(), '.android.env') });

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
    platformName: 'Android',
    maxInstances: 1,
    // For W3C the appium capabilities need to have an extension prefix
    // http://appium.io/docs/en/writing-running-appium/caps/
    // This is `appium:` for all Appium Capabilities which can be found here
    'appium:deviceName': process.env.DEVICE_NAME,
    'appium:platformVersion': process.env.PLATFORM_VERSION,
    'appium:automationName': process.env.AUTOMATION_NAME,
    'appium:app': process.env.APP_PATH,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:appActivity': process.env.APP_ACTIVITY,
    'appium:newCommandTimeout': 240,
    'appium:appPackage': process.env.BUNDLE_ID,
    'appium:noReset': true,
  },
];

// @ts-ignore
// config.cucumberOpts.tagExpression = '@androidApp';

exports.config = config;
