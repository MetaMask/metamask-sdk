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
    // http://appium.io/docs/en/writing-running-appium/caps/
    'appium:deviceName': process.env.DEVICE_NAME ?? '',
    'appium:platformVersion': process.env.PLATFORM_VERSION ?? '',
    'appium:automationName': process.env.AUTOMATION_NAME ?? '',
    'appium:app': process.env.APP_PATH ?? '',
    'appium:bundleId': process.env.BUNDLE_ID ?? '',
    'appium:udid': process.env.DEVICE_UDID ?? '',
    'appium:newCommandTimeout': 240,
    'appium:waitForQuiescence': true,
    'appium:noReset': true,
    'appium:autoLaunch': false,
    'appium:language': 'en',
    'appium:fullReset': false,
    'appium:settings[snapshotMaxDepth]': 62,
    'appium:settings[customSnapshotTimeout]': 50000,
    'appium:includeSafariInWebviews': true,
    'appium:chromeDriverExecutable': '',
    'appium:chromedriverAutodownload': true,
    // "appium:usePreinstalledWDA": true,
    // "appium:updatedWDABundleId": "io.metamask.mmsdk.chris.qa",
    // "appium:wdaLaunchTimeout": 120000,
    // {"appium:settings[snapshotMaxDepth]": 62, "appium:settings[customSnapshotTimeout]": 50000}
  } as Capabilities.AppiumXCUITestCapabilities,
];

export { config };
