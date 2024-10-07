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
  APP_PATH,
  METAMASK_BUNDLE_ID,
  PLATFORM,
  Platforms,
  LOCALHOST,
} from './Constants';

export const getSelectorForPlatform = (locator: MetaMaskElementSelector) => {
  const platformSelector =
    PLATFORM === Platforms.IOS ? locator.iosSelector : locator.androidSelector;
  if (platformSelector === undefined) {
    throw new Error(`Selector for ${PLATFORM} needs to be provided!`);
  }

  return platformSelector;
};

class Utils {
  static async launchApp(bundleId: string): Promise<void> {
    // Location can be either url for web test dapp or bundleId for native app
    console.log(`Launching ${PLATFORM} DAPP with bundleId: ${bundleId}`);
    await driver.activateApp(bundleId);

    if (driver.isAndroid) {
      await driver.setOrientation('PORTRAIT');
    }
  }

  static async launchMetaMask(): Promise<void> {
    console.log(`Launching MetaMask on ${PLATFORM}`);
    await driver.activateApp(METAMASK_BUNDLE_ID);
  }

  /*
   * Little helper to reinstall a given app based on a file path
   * This usually refers to the const APP_PATH
   */
  static async reinstallApp({
    filePath,
    bundleId,
  }: {
    filePath: string;
    bundleId: string;
  }): Promise<void> {
    // await driver.removeApp(bundleId);
    // await driver.installApp(filePath);
    await driver.activateApp(bundleId);
  }

  /*
   * Launches MetaMask with a fixture
   * This means that MM will load in a fully onboarded state
   *
   * @param {FixtureServer} fixtureServer - server fixture running in the background
   * */
  static async launchMetaMaskWithFixture(
    fixtureServer: FixtureServer,
    bundleId: string,
  ): Promise<void> {
    if (PLATFORM === Platforms.ANDROID) {
      console.log('Android test detected. Reversing TCP ports...');
      // We'll need this once we start runing tests on CI
      const adb = new ADB({
        adbHost: LOCALHOST,
        adbPort: 5037,
      });
      // const adb = await ADB.createADB({});
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
      await driver.pause(5000);
      await driver.pause(5000);
      await driver.executeScript('mobile:launchApp', [
        {
          bundleId,
          fixtureServerPort: `${FIXTURE_SERVER_PORT}`,
        },
      ]);
      // const t = {"bundleId": "io.metamask.MetaMask-QA", "fixtureServerPort": 12345}
    } else {
      await this.reinstallApp({
        filePath: APP_PATH,
        bundleId: METAMASK_BUNDLE_ID,
      });
    }

    console.log('MetaMask was loaded with fixtures!');
  }

  /*
   * Kills the process of the dapp with the given bundleId
   * Not the same as the dappTerminate that cleans a session
   * */
  static async killApp(bundleId: string): Promise<void> {
    console.log(`Terminating ${PLATFORM} DAPP with bundleId: ${bundleId}`);
    await driver.terminateApp(bundleId);
  }

  static async getScreenSize(): Promise<BrowserSize> {
    return await driver.getWindowSize();
  }

  /*
   * Returns the coordinates in the device screen for a given percentage
   * Ex:
   * x = 50% of the screen width
   * y = 50% of the screen height
   * Device size: 1000x1000
   *
   * returns: {x: 5000, y: 5000}
   * */
  static async getCoordinatesForDeviceFromPercentage(
    percentage: ScreenPercentage,
  ): Promise<Coordinates> {
    const DEVICE_SIZE = await Utils.getScreenSize();
    const x = Math.round((DEVICE_SIZE.width * percentage.x) / 100);
    const y = Math.round((DEVICE_SIZE.height * percentage.y) / 100);
    return { x, y };
  }

  static async getCoordinatesAsPercentage(
    from: Coordinates,
    to: Coordinates,
  ): Promise<[Coordinates, Coordinates]> {
    const DEVICE_SIZE = await Utils.getScreenSize();
    const x1Percentage = Math.round((DEVICE_SIZE.width * from.x) / 100);
    const y1Percentage = Math.round((DEVICE_SIZE.height * from.y) / 100);
    const x2Percentage = Math.round((DEVICE_SIZE.width * to.x) / 100);
    const y2Percentage = Math.round((DEVICE_SIZE.height * to.y) / 100);
    return [
      { x: x1Percentage, y: y1Percentage },
      { x: x2Percentage, y: y2Percentage },
    ];
  }
}
export default Utils;
