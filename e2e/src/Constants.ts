export const WALLET_PASSWORD = 'asdasdasd';

export const Browsers = {
  SAFARI: 'com.apple.mobilesafari',
  CHROME: 'com.android.chrome',
};

export const NATIVE_APPS = {
  ANDROID: {
    SETTINGS: 'com.android.settings',
  },
};
export const SRP =
  process.env.SRP ??
  'test test test test test test test test test test test test';

export const FIXTURE_SERVER_PORT = 12345;

export const FIXTURE_SERVER_URL = `http://localhost:12345/state.json`;

export const BROWSER_BUNDLE_ID = driver.isIOS
  ? Browsers.SAFARI
  : Browsers.CHROME;

// This comes from the config file, it'll never be undefined otherwise there are no tests to run
export const METAMASK_BUNDLE_ID = process.env.BUNDLE_ID as string;
