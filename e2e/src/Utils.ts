import {
  BrowserSize,
  Coordinates,
  MetaMaskElementLocator,
  ScreenPercentage,
} from './Types';

export const Platform = driver.isIOS ? 'IOS' : 'ANDROID';

class Utils {
  static getLocatorPerPlatformAndStrategy(
    locator: MetaMaskElementLocator,
  ): string {
    const platformLocator = driver.isIOS
      ? locator.iosLocator
      : locator.androidLocator;

    // In case the locator was not provided for the platform it is running on
    if (platformLocator === undefined) {
      throw new Error(`Locator for ${Platform} needs to be provided!`);
    }

    if (driver.isIOS && locator.iosLocator !== undefined) {
      return `${platformLocator.strategy}${locator.iosLocator.locator}`;
    } else if (driver.isAndroid && locator.androidLocator !== undefined) {
      // Explicitly check for driver.isAndroid in case we want to add web tests
      return `${platformLocator.strategy}${locator.androidLocator.locator}`;
    }
    throw new Error('Platform locator is undefined');
  }

  static async launchApp(bundleId: string): Promise<void> {
    // Location can be either url for web test dapp or bundleId for native app
    console.log(`Launching ${Platform} DAPP with bundleId: ${bundleId}`);
    await driver.activateApp(bundleId);
  }

  static async launchMetaMask(): Promise<void> {
    console.log(`Launching MetaMask on ${Platform}`);
    const metamaskBundleId = process.env.BUNDLE_ID as string;
    await driver.activateApp(metamaskBundleId);
  }

  /*
   * Kills the process of the dapp with the given bundleId
   * Not the same as the dappTerminate that cleans a session
   * */
  static async killApp(bundleId: string): Promise<void> {
    console.log(`Terminating ${Platform} DAPP with bundleId: ${bundleId}`);
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
