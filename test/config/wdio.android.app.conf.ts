import * as path from 'path';
import config from './wdio.shared.local.appium.conf';

// ============
// Specs
// ============
config.specs = ['./features/*.feature'];

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
    'appium:deviceName': 'Pixel_3_MM_30',
    'appium:platformVersion': '11.0',
    'appium:automationName': 'UiAutomator2',
    // The path to the app -> needs to be adapted for CICD
    'appium:app': path.join(process.cwd(), 'app/android/app-qa-release.apk'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:appActivity': 'io.metamask.MainActivity',
    'appium:newCommandTimeout': 240,
    'appium:appPackage': 'io.metamask.qa',
  },
];

exports.config = config;
