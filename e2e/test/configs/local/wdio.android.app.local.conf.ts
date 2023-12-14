import path from 'path';
import * as dotenv from 'dotenv';

import config from './wdio.shared.local.appium.conf';

dotenv.config({ path: path.join(process.cwd(), '.android.env') });

config.capabilities = [
  {
    // The defaults you need to have in your config
    platformName: 'Android',
    maxInstances: 1,
    'appium:deviceName': process.env.DEVICE_NAME,
    'appium:platformVersion': process.env.PLATFORM_VERSION,
    'appium:automationName': process.env.AUTOMATION_NAME,
    'appium:app': process.env.APP_PATH,
    'appium:appActivity': process.env.APP_ACTIVITY,
    'appium:newCommandTimeout': 360,
    'appium:appPackage': process.env.BUNDLE_ID,
    /* This setting will tell Appium if it need to install the app or no. */
    'appium:noReset': false,
    // 'appium:optionalIntentArguments': '--es fixtureServerPort 12345'
  },
];

exports.config = config;
