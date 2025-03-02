import path from 'path';
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
    platformName: 'iOS',
    maxInstances: 1,
    // For W3C the appium capabilities need to have an extension prefix
    // http://appium.io/docs/en/writing-running-appium/caps/
    // This is `appium:` for all Appium Capabilities which can be found here
    'appium:deviceName': 'iPhone 11 Pro',
    'appium:platformVersion': '16.2',
    'appium:automationName': 'XCUITest',
    // The path to the app -> needs to be adapted for CICD
    'appium:app': path.join(process.cwd(), 'app/ios/MetaMask.app'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:bundleId': 'io.metamask.MetaMask',
    // Local simulator
    'appium:udid': '7327432D-A89A-4955-9A9F-CF4CBFDA43D1',
    'appium:xcodeSigningId': 'iPhone Developer',
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:language': 'en',
  },
];

exports.config = config;
