import path from 'path';
import dotenv from 'dotenv';
import { getOtherAppsPath } from '../../../src/Utils';
import config from './wdio.shared.browserstack.conf';

dotenv.config({ path: path.join(process.cwd(), '.ios.env') });


config.capabilities = [
  {
    // The defaults you need to have in your config
    platformName: 'iOS',
    maxInstances: 1,
    'appium:deviceName': 'iPhone 15 Pro Max',
    'appium:platformVersion': '17.1',
    'appium:automationName': 'XCUITest',
    'appium:app': process.env.APP_PATH,
    'appium:otherApps': getOtherAppsPath(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:bundleId': process.env.BUNDLE_ID,
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
