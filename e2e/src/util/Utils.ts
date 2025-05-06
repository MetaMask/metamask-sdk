import ADB from 'appium-adb';
import { driver } from '@wdio/globals';
import LockScreen from '@screens/MetaMask/LockScreen';
import { Dapp } from '@screens/interfaces/Dapp';
import SafariBrowserScreen from '@screens/iOS/SafariBrowserScreen';
import ChromeBrowserScreen from '@screens/Android/ChromeBrowserScreen';
import AndroidOpenWithComponent from '@screens/Android/components/AndroidOpenWithComponent';
import iOSOpenInComponent from '@screens/iOS/components/IOSOpenInComponent';
import { loadFixture, startFixtureServer } from '@fixtures/FixtureHelper';
import { FixtureBuilder } from '@fixtures/FixtureBuilder';
import FixtureServer from '@fixtures/FixtureServer';
import {
  BrowserSize,
  Coordinates,
  MetaMaskElementSelector,
  ScreenPercentage,
} from './types';
import {
  FIXTURE_SERVER_PORT,
  METAMASK_BUNDLE_ID,
  PLATFORM,
  Platforms,
  LOCALHOST,
  WALLET_PASSWORD,
  Browsers,
  Contexts,
} from './Constants';
import Gestures from './Gestures';

export const deviceOpenDeeplinkWithMetaMask = async () => {
  if (PLATFORM === Platforms.IOS) {
    await iOSOpenInComponent.tapOpen();
  } else {
    await AndroidOpenWithComponent.tapOpenWithMetaMask();
  }
};

export const getSelectorForPlatform = (locator: MetaMaskElementSelector) => {
  const platformSelector =
    PLATFORM === Platforms.IOS ? locator.iosSelector : locator.androidSelector;
  if (platformSelector === undefined) {
    throw new Error(`Selector for ${PLATFORM} needs to be provided!`);
  }

  return platformSelector;
};

export const launchMobileBrowser = async () => {
  if (driver.isIOS) {
    await driver.activateApp(Browsers.SAFARI);
  } else {
    await driver.activateApp(Browsers.CHROME);
  }
};

export const restartAndUnlockMetaMask = async () => {
  await driver.terminateApp(METAMASK_BUNDLE_ID);
  await driver.activateApp(METAMASK_BUNDLE_ID);
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
};

export const navigateToWebMobileDapp = async (
  dappUrl: string,
  dappScreen: Dapp,
) => {
  const browserScreen = driver.isIOS
    ? SafariBrowserScreen
    : ChromeBrowserScreen;

  // await launchMobileBrowser();
  await browserScreen.goToAddress(dappUrl, dappScreen);
};

export const refreshBrowser = async () => {
  const browserScreen = driver.isIOS
    ? SafariBrowserScreen
    : ChromeBrowserScreen;

  await browserScreen.refreshPage();
};

export const scrollToElement = async (element: ChainablePromiseElement) => {
  let isElementDisplayed = await element.isDisplayed();

  while (!isElementDisplayed) {
    await Gestures.swipeByPercentage({ x: 50, y: 70 }, { x: 50, y: 5 });
    isElementDisplayed = await element.isDisplayed();
  }
};

export const launchApp = async (bundleId: string) => {
  // Location can be either url for web test dapp or bundleId for native app
  console.log(`Launching ${PLATFORM} DAPP with bundleId: ${bundleId}`);
  await driver.activateApp(bundleId);

  if (driver.isAndroid) {
    await driver.setOrientation('PORTRAIT');
  }
};

export const launchMetaMask = async () => {
  console.log(`Launching MetaMask on ${PLATFORM}`);
  await driver.activateApp(METAMASK_BUNDLE_ID);
};

export const goBack = async () => {
  const browserToOpen = driver.isIOS ? Browsers.SAFARI : Browsers.CHROME;

  await driver.pause(2500);
  await Gestures.tapOnCoordinatesByPercentage({ x: 50, y: 80 });
  await driver.pause(500);
  await launchApp(browserToOpen);
};

/*
 * Kills the process of the dapp with the given bundleId
 * Not the same as the dappTerminate that cleans a session
 * */
export const killApp = async (bundleId: string) => {
  console.log(`Terminating ${PLATFORM} DAPP with bundleId: ${bundleId}`);
  await driver.terminateApp(bundleId);
};

export const getScreenSize = async (): Promise<BrowserSize> => {
  return await driver.getWindowSize();
};

/*
 * Returns the coordinates in the device screen for a given percentage
 * Ex:
 * x = 50% of the screen width
 * y = 50% of the screen height
 * Device size: 1000x1000
 *
 * returns: {x: 5000, y: 5000}
 * */
export const getCoordinatesForDeviceFromPercentage = async (
  percentage: ScreenPercentage,
): Promise<Coordinates> => {
  const DEVICE_SIZE = await getScreenSize();
  const x = Math.round((DEVICE_SIZE.width * percentage.x) / 100);
  const y = Math.round((DEVICE_SIZE.height * percentage.y) / 100);
  return { x, y };
};

export const getCoordinatesAsPercentage = async (
  from: Coordinates,
  to: Coordinates,
): Promise<[Coordinates, Coordinates]> => {
  const DEVICE_SIZE = await getScreenSize();
  const x1Percentage = Math.round((DEVICE_SIZE.width * from.x) / 100);
  const y1Percentage = Math.round((DEVICE_SIZE.height * from.y) / 100);
  const x2Percentage = Math.round((DEVICE_SIZE.width * to.x) / 100);
  const y2Percentage = Math.round((DEVICE_SIZE.height * to.y) / 100);
  return [
    { x: x1Percentage, y: y1Percentage },
    { x: x2Percentage, y: y2Percentage },
  ];
};

/*
 * WIP! This function is not working as expected
 * Launches MetaMask with a fixture
 * This means that MM will load in a fully onboarded state
 *
 * Disclaimer: iOS does not support launching with a fixture for the time being
 *
 * @param {FixtureServer} fixtureServer - server fixture running in the background
 * */
export const launchMetaMaskWithFixture = async (
  fixtureServer: FixtureServer,
  bundleId: string,
) => {
  const fixture = new FixtureBuilder().withDefaultFixture().build();
  await startFixtureServer(fixtureServer);
  await loadFixture(fixtureServer, { fixture });

  if (PLATFORM === Platforms.ANDROID) {
    console.log('Android test detected. Reversing TCP ports...');
    const adb = new ADB({
      adbHost: LOCALHOST,
      adbPort: 5037,
    });

    await adb.reversePort(FIXTURE_SERVER_PORT, FIXTURE_SERVER_PORT);

    await launchApp(METAMASK_BUNDLE_ID);
    return;
  }

  // Specific executeScript to launch MetaMask on iOS
  console.log('Re-launching MetaMask on iOS...');
  await driver.executeScript('mobile:launchApp', [
    {
      bundleId,
      arguments: ['fixtureServerPort', '12345'],
      environment: {
        fixtureServerPort: `${FIXTURE_SERVER_PORT}`,
      },
    },
  ]);

  // {"bundleId": "io.metamask.MetaMask-QA", "arguments": ["fixtureServerPort", "12345"], "environment": {"fixtureServerPort": "12345"}}

  console.log('MetaMask was loaded with fixtures!');
};

export const getWebViewElementText = async (locator: string) => {
  const webviewElementText = await driver.executeScript(
    `const element = document.querySelector('${locator}');
    return element ? element.innerText || element.textContent : '';`,
    [],
  );
  return webviewElementText;
};

export const switchToNativeContext = async () => {
  const availableContexts = await driver.getContexts();
  const nativeContext = availableContexts.find(
    (ctx) => (typeof ctx === 'string' ? ctx : ctx.id) === Contexts.NATIVE,
  );
  try {
    if (nativeContext) {
      const contextId =
        typeof nativeContext === 'string' ? nativeContext : nativeContext.id;
      await driver.switchContext(contextId);
    } else {
      console.log('Native context not found in available contexts');
    }
  } catch (error) {
    console.log('Error switching to native context:', error);
  }
};

export const switchToWebviewContext = async (dappUrl: string) => {
  const availableContexts = await driver.getContexts();
  const webviewContext = availableContexts.find((context) => {
    if (typeof context === 'string') {
      return context.includes('WEBVIEW');
    } else if (typeof context === 'object' && context !== null) {
      const contextUrl = context.url || '';
      return contextUrl.includes(dappUrl);
    }
    return false;
  });

  console.log('Selected webview context:', webviewContext);

  if (webviewContext) {
    // Use the id property if it's an object, otherwise use the context directly
    const contextId =
      typeof webviewContext === 'object' ? webviewContext.id : webviewContext;
    console.log(`Switching to context ID: ${contextId}`);
    await driver.switchContext(contextId);
    console.log('Successfully switched context');
  } else {
    console.log('No matching webview context found');
  }
};

export const switchToContext = async ({
  context,
  dappUrl,
}: {
  context: (typeof Contexts)[keyof typeof Contexts];
  dappUrl?: string;
}) => {
  if (context === Contexts.NATIVE) {
    await switchToNativeContext();
  } else if (dappUrl) {
    await switchToWebviewContext(dappUrl);
  } else {
    throw new Error('Invalid Context or Dapp URL provided');
  }
};

/**
 * Executes actions in the mobile (native) context, handling the context switching automatically
 * @param actionFn - The function containing actions to perform in the native context
 * @returns The result of the action function
 */
export const withMobileAction = async <T>(
  actionFn: () => Promise<T>,
): Promise<T> => {
  // Switch to native context
  await switchToContext({
    context: Contexts.NATIVE,
  });

  // Execute the mobile actions
  const result = await actionFn();

  // Return the result
  return result;
};

/**
 * Executes actions in the web context, handling the context switching automatically
 * @param dappUrl - The URL of the dapp to switch context to
 * @param actionFn - The function containing actions to perform in the web context
 * @returns The result of the action function
 */
export const withWebAction = async <T>(
  dappUrl: string,
  actionFn: () => Promise<T>,
): Promise<T> => {
  // Switch to webview context
  await switchToContext({
    context: Contexts.WEBVIEW,
    dappUrl,
  });

  // Execute the web actions
  const result = await actionFn();

  // Return the result
  return result;
};
