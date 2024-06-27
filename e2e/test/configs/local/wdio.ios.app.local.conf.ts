import path from 'path';
import * as dotenv from 'dotenv';

import type { Capabilities } from '@wdio/types';
import config from './wdio.shared.local.appium.conf';

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
    platformName: 'iOS',
    maxInstances: 1,
    // http://appium.io/docs/en/writing-running-appium/caps/
    'appium:deviceName': process.env.DEVICE_NAME ?? '',
    'appium:platformVersion': process.env.PLATFORM_VERSION ?? '',
    'appium:automationName': process.env.AUTOMATION_NAME ?? '',
    'appium:app': process.env.APP_PATH ?? '',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'appium:bundleId': process.env.BUNDLE_ID ?? '',
    'appium:udid': process.env.DEVICE_UDID ?? '',
    /*
    'appium:otherApps': [
      process.env.ANDROID_SDK_TEST_APP_PATH ?? '',
      process.env.RN_TEST_APP_PATH ?? '',
    ],
     */
    // "appium:xcodeSigningId": "iPhone Developer",
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:language': 'en',
    'appium:fullReset': true,
    'appium:settings[snapshotMaxDepth]': 62,
    'appium:settings[customSnapshotTimeout]': 50000,
  } as Capabilities.RemoteCapability,
];
export { config };
