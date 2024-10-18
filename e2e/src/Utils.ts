import ADB from 'appium-adb';
import { driver } from '@wdio/globals';
import { FixtureBuilder } from '../test/fixtures/FixtureBuilder';
import {
  loadFixture,
  startFixtureServer,
} from '../test/fixtures/FixtureHelper';
import FixtureServer from '../test/fixtures/FixtureServer';
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
  BrowsersActivity,
} from './Constants';
import LockScreen from './screens/MetaMask/LockScreen';
import { Dapp } from './screens/interfaces/Dapp';
import SafariBrowserScreen from './screens/iOS/SafariBrowserScreen';
import ChromeBrowserScreen from './screens/Android/ChromeBrowserScreen';
import Gestures from './Gestures';
import AndroidOpenWithComponent from './screens/Android/components/AndroidOpenWithComponent';
import iOSOpenInComponent from './screens/iOS/components/IOSOpenInComponent';

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

  await launchMobileBrowser();
  await browserScreen.goToAddress(dappUrl, dappScreen);
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
  if (driver.isIOS) {
    // Letting the loader appear
    await driver.pause(2500);
    await Gestures.tapOnCoordinatesByPercentage({ x: 50, y: 80 });
    await driver.pause(500);
    await launchApp(Browsers.SAFARI);
    return;
  }

  // Android wait to go back since it takes a while for it to happen in the
  // current version of the app
  let currentActivity = await driver.getCurrentActivity();
  while (currentActivity !== BrowsersActivity.CHROME) {
    await driver.pause(2000);
    currentActivity = await driver.getCurrentActivity();
  }

  // Waiting for the dapp to fetch updates before trying to assert them
  await driver.pause(3000);
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
  // NOT NEEDED FOR BrowserStack
  if (PLATFORM === Platforms.ANDROID) {
    console.log('Android test detected. Reversing TCP ports...');
    const adb = new ADB({
      adbHost: LOCALHOST,
      adbPort: 5037,
    });
    await driver.pause(5000);
    await adb.reversePort(FIXTURE_SERVER_PORT, FIXTURE_SERVER_PORT);
    await driver.pause(5000);
  }

  const fixture = new FixtureBuilder().withDefaultFixture().build();
  await startFixtureServer(fixtureServer);
  await loadFixture(fixtureServer, { fixture });

  console.log(`Re-launching MetaMask on ${PLATFORM}...`);
  if (PLATFORM === Platforms.IOS) {
    console.log('Pausing for 10 seconds...');
    await driver.pause(20000);

    await driver.executeScript('mobile:launchApp', [
      {
        bundleId,
        arguments: ['fixtureServerPort', '12345'],
        environment: {
          fixtureServerPort: `${FIXTURE_SERVER_PORT}`,
        },
      },
    ]);
  } else {
    await launchApp(METAMASK_BUNDLE_ID);
  }

  console.log('MetaMask was loaded with fixtures!');
};
