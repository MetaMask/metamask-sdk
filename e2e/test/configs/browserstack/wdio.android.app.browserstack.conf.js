/* eslint-disable node/no-process-env */
const path = require('path');
const dotenv = require('dotenv');
const config = require('./wdio.shared.browserstack.conf');

dotenv.config({ path: path.join(process.cwd(), '.android.env') });

config.capabilities = [
  {
    // The defaults you need to have in your config
    platformName: 'Android',
    maxInstances: 1,
    interactiveDebugging: true,
    'appium:deviceName': 'Google Pixel 7',
    'appium:platformVersion': '13.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.APP_PATH,
    'appium:appActivity': 'io.metamask.MainActivity',
    'appium:newCommandTimeout': 360,
    'appium:appPackage': process.env.BUNDLE_ID,
    /* This setting will tell Appium if it need to install the app or no. */
    'appium:noReset': false,
    // 'appium:optionalIntentArguments': '--es fixtureServerPort 12345'
  },
];

// eslint-disable-next-line node/exports-style
exports.config = config;
