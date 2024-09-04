export const WALLET_PASSWORD = '123123123';

export const Browsers = {
  SAFARI: 'com.apple.mobilesafari',
  CHROME: 'com.android.chrome',
};

export const NATIVE_OS_APPS = {
  ANDROID: {
    SETTINGS: 'com.android.settings',
  },
};

export const Platforms = {
  ANDROID: 'ANDROID',
  IOS: 'IOS',
};

export const PLATFORM = driver.isIOS ? Platforms.IOS : Platforms.ANDROID;

export const SRP =
  process.env.SRP ??
  'test test test test test test test test test test test test';

export const BROWSER_BUNDLE_ID = driver.isIOS
  ? Browsers.SAFARI
  : Browsers.CHROME;

// This comes from the config file, it'll never be undefined otherwise there are no tests to run
export const METAMASK_BUNDLE_ID = process.env.BUNDLE_ID as string;

export const METAMASK_APP_NAME_ANDROID =
  METAMASK_BUNDLE_ID === 'io.metamask.qa' ? 'MetaMask-QA' : 'MetaMask';

export const WDIO_IOS_CLASS_CHAIN = '-ios class chain:';
export const WDIO_IOS_PREDICATE_STRING = '-ios predicate string:';
export const WDIO_ANDROID_UI_AUTOMATOR = 'android=';
export const WDIO_XPATH = '';
export const WDIO_ACCESSIBILITY_ID = '~';
export const WDIO_RESOURCE_ID = 'id:';

const APP_PATH = process.env.APP_PATH as string;
export const IS_RUNNING_IN_BROWSER_STACK = APP_PATH.startsWith('bs://');

/*
export const FIXTURE_SERVER_HOST = IS_RUNNING_IN_BROWSER_STACK
  ? 'bs-local.com'
  : 'localhost';

 */

export const FIXTURE_SERVER_HOST = 'localhost';

export const FIXTURE_SERVER_PORT = 12345;
export const FIXTURE_SERVER_URL = `http://${FIXTURE_SERVER_HOST}:${FIXTURE_SERVER_PORT}/state.json`;
