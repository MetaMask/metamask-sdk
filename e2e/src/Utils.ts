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
   * Launches MetaMask with a fixture
   * This means that MM will load in a fully onboarded state
   *
   * @param {FixtureServer} fixtureServer - server fixture running in the background
   * */
  static async launchMetaMaskWithFixture(
    fixtureServer: FixtureServer,
    bundleId: string,
  ): Promise<void> {
    // Little helper to activate the app for the platform. This is helpful
    // since the Android driver expects a key named appId and iOS expects a key
    // named bundleId
    if (PLATFORM === Platforms.ANDROID) {
      console.log('Android test detected. Reversing TCP ports...');
      /*
      const adb = new ADB({
        adbHost: 'localhost',
        adbPort: 5037,
      });
       */
      const adb = await ADB.createADB({});
      await driver.pause(5000);
      await adb.reversePort(FIXTURE_SERVER_PORT, FIXTURE_SERVER_PORT);
      await driver.pause(5000);
    }

    const fixture = new FixtureBuilder().build();
    await startFixtureServer(fixtureServer);
    await loadFixture(fixtureServer, { fixture });

    await driver.pause(5000);
    await driver.pause(5000);
    await driver.pause(5000);

    console.log('Terminating app');
    await driver.terminateApp(bundleId);

    console.log('App is terminated, cooling down for 5s');
    await driver.pause(5000);

    console.log(`Re-launching MetaMask on ${PLATFORM}...`);
    if (PLATFORM === Platforms.IOS) {
      /*
      await driver.executeScript('mobile: launchApp', [
        {
          bundleId,
          fixtureServerPort: `${FIXTURE_SERVER_PORT}`,
        },
      ]);
       */
      await driver.activateApp(bundleId);
    } else {
      await driver.activateApp(bundleId);
      console.log('App is launched, cooling down for 3s');
      await driver.pause(5000);
      /*
      await driver.execute('mobile: activateApp', {
        appId: bundleId,
        fixtureServerPort: `${FIXTURE_SERVER_PORT}`,
      });
       */

      console.log('Launched Android MetaMask with fixture');
    }
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
