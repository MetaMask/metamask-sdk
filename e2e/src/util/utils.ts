import ADB from 'appium-adb';
import { driver } from '@wdio/globals';
import LockScreen from '@screens/MetaMask/LockScreen';
import { Dapp } from '@screens/interfaces/Dapp';
import safariBrowserScreen from '@screens/iOS/SafariBrowserScreen';
import chromeBrowserScreen from '@screens/Android/ChromeBrowserScreen';
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
} from './constants';
import { tapOnCoordinatesByPercentage } from './gestures';

/**
 * Returns the selector for the given platform
 * @param locator - The locator to get the selector for
 * @returns The selector for the given platform
 */
export const getSelectorForPlatform = (locator: MetaMaskElementSelector) => {
  const platformSelector =
    PLATFORM === Platforms.IOS ? locator.iosSelector : locator.androidSelector;
  if (platformSelector === undefined) {
    throw new Error(`Selector for ${PLATFORM} needs to be provided!`);
  }

  return platformSelector;
};

/**
 * Launches the mobile browser for the given platform
 * @returns void
 */
export const launchMobileBrowser = async () => {
  if (driver.isIOS) {
    await driver.activateApp(Browsers.SAFARI);
  } else {
    await driver.activateApp(Browsers.CHROME);
  }
};

/**
 * Restarts the MetaMask app and unlocks it with the given password
 * @returns void
 */
export const restartAndUnlockMetaMask = async () => {
  await driver.terminateApp(METAMASK_BUNDLE_ID);
  await driver.activateApp(METAMASK_BUNDLE_ID);
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
};

/**
 * Navigates to the given web mobile dapp
 * @param dappUrl - The URL of the dapp to navigate to
 * @param dappScreen - The screen of the dapp to navigate to
 * @returns void
 */
export const navigateToWebMobileDapp = async (
  dappUrl: string,
  dappScreen: Dapp,
) => {
  const browserScreen = driver.isIOS
    ? safariBrowserScreen
    : chromeBrowserScreen;

  // await launchMobileBrowser();
  await browserScreen.goToAddress(dappUrl, dappScreen);
};

/**
 * Refreshes the browser
 * @returns void
 */
export const refreshBrowser = async () => {
  const browserScreen = driver.isIOS
    ? safariBrowserScreen
    : chromeBrowserScreen;

  await browserScreen.refreshPage();
};

/**
 * Launches the app with the given bundleId
 * @param bundleId - The bundleId of the app to launch
 * @returns void
 */
export const launchApp = async (bundleId: string) => {
  // Location can be either url for web test dapp or bundleId for native app
  console.log(`Launching ${PLATFORM} DAPP with bundleId: ${bundleId}`);
  await driver.activateApp(bundleId);

  if (driver.isAndroid) {
    await driver.setOrientation('PORTRAIT');
  }
};

/**
 * Launches the MetaMask app
 * @returns void
 */
export const launchMetaMask = async () => {
  console.log(`Launching MetaMask on ${PLATFORM}`);
  await driver.activateApp(METAMASK_BUNDLE_ID);
};

/**
 * Goes back to the previous screen
 * @returns void
 */
export const goBack = async () => {
  const browserToOpen = driver.isIOS ? Browsers.SAFARI : Browsers.CHROME;

  await driver.pause(2500);
  await tapOnCoordinatesByPercentage({ x: 50, y: 80 });
  await driver.pause(500);
  await launchApp(browserToOpen);
};

/**
 * Kills the process of the dapp with the given bundleId
 * Not the same as the dappTerminate that cleans a session
 * @param bundleId - The bundleId of the app to kill
 * @returns void
 */
export const killApp = async (bundleId: string) => {
  console.log(`Terminating ${PLATFORM} DAPP with bundleId: ${bundleId}`);
  await driver.terminateApp(bundleId);
};

/**
 * Returns the screen size of the device
 * @returns The screen size of the device
 */
export const getScreenSize = async (): Promise<BrowserSize> => {
  return await driver.getWindowSize();
};

/**
 * Converts screen percentage coordinates to actual device coordinates
 *
 * @param percentages - Single percentage point or from/to percentage points for swipe
 * @returns Single coordinate or array of coordinates based on input
 *
 * Examples:
 * 1. Single point:
 *    Input: {x: 50, y: 50}
 *    Output: {x: 500, y: 500} (on a 1000x1000 device)
 *
 * 2. Two points (swipe):
 *    Input: from: {x: 20, y: 80}, to: {x: 80, y: 20}
 *    Output: [{x: 200, y: 800}, {x: 800, y: 200}] (on a 1000x1000 device)
 */
export const getDeviceCoordinates = async (
  percentages: ScreenPercentage | { from: Coordinates; to: Coordinates },
): Promise<Coordinates | [Coordinates, Coordinates]> => {
  const DEVICE_SIZE = await getScreenSize();

  // Handle single point case
  if ('x' in percentages && 'y' in percentages) {
    const x = Math.round((DEVICE_SIZE.width * percentages.x) / 100);
    const y = Math.round((DEVICE_SIZE.height * percentages.y) / 100);
    return { x, y };
  }
  // Handle from/to case (swipe)
  else if ('from' in percentages && 'to' in percentages) {
    const { from, to } = percentages;
    const x1 = Math.round((DEVICE_SIZE.width * from.x) / 100);
    const y1 = Math.round((DEVICE_SIZE.height * from.y) / 100);
    const x2 = Math.round((DEVICE_SIZE.width * to.x) / 100);
    const y2 = Math.round((DEVICE_SIZE.height * to.y) / 100);
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }

  throw new Error('Invalid input format for coordinate conversion');
};

/**
 * Launches MetaMask with a fixture
 * This means that MM will load in a fully onboarded state
 *
 * Disclaimer: iOS does not support launching with a fixture for the time being
 * @param fixtureServer - server fixture running in the background
 * @param bundleId - The bundleId of the app to launch
 * @returns void
 */
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

  console.log('MetaMask was loaded with fixtures!');
};

/**
 * Returns the text of the given webview element
 * @param locator - The locator of the webview element
 * @returns The text of the given webview element
 */
export const getWebViewElementText = async (locator: string) => {
  const webviewElementText = await driver.executeScript(
    `const element = document.querySelector('${locator}');
    return element ? element.innerText || element.textContent : '';`,
    [],
  );
  return webviewElementText;
};

/**
 * Switches to the native context
 * @returns void
 */
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

/**
 * Switches to the webview context
 * @param dappUrl - The URL of the dapp to switch context to
 * @returns void
 */
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

/**
 * Switches to the given context
 * @param context - The context to switch to
 * @param dappUrl - The URL of the dapp to switch context to
 * @returns void
 */
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
