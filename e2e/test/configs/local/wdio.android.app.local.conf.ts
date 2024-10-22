import path from 'path';
import * as dotenv from 'dotenv';
import type { Capabilities } from '@wdio/types';

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
    'appium:appActivity': 'io.metamask.MainActivity',
    'appium:app': process.env.APP_PATH ?? '',
    'appium:newCommandTimeout': 360,
    'appium:appPackage': process.env.BUNDLE_ID,
    'appium:autoLaunch': false,
    'appium:noReset': true,
    'appium:dontStopAppOnReset': true,
    'appium:fullReset': false,
  } as Capabilities.AppiumAndroidCapabilities,
];

export { config };
