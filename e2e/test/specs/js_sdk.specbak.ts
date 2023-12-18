import {
  BROWSER_BUNDLE_ID,
  Browsers,
  WALLET_PASSWORD,
} from '../../src/Constants';
import Utils from '../../src/Utils';
import ChromeBrowserScreen from '../../src/screens/Android/ChromeBrowserScreen';
import AndroidOpenWithComponent from '../../src/screens/Android/components/AndroidOpenWithComponent';
import CreateReactDappScreen from '../../src/screens/Dapps/CreateReactDappScreen';
import TestDappScreen from '../../src/screens/Dapps/TestDappScreen';
import LockScreen from '../../src/screens/MetaMask/LockScreen';
import ConnectModalComponent from '../../src/screens/MetaMask/components/ConnectModalComponent';
import SignModalComponent from '../../src/screens/MetaMask/components/SignModalComponent';
import SafariBrowserScreen from '../../src/screens/iOS/SafariBrowserScreen';
import { afterEachHook, beforeEachHook, beforeHook } from '../mocha.hooks';

describe('JS SDK Connection', () => {
  before(async () => {
    await beforeHook();
  });

  beforeEach(async () => {
    // return;
    await beforeEachHook();
  });

  afterEach(async () => {
    return;
    await afterEachHook();
  });

  it('Connect to the Test-Dapp', async () => {
    await driver.pause(10000);

    // Kill and launch the mobile browser
    const bundleId = driver.isIOS ? Browsers.SAFARI : Browsers.CHROME;
    await Utils.killApp(bundleId);
    await Utils.launchApp(bundleId);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const testDappUrl = process.env.TEST_DAPP_URL ?? '';

    if (driver.isAndroid) {
      await (browserScreen as typeof ChromeBrowserScreen).tapSwitchTabsButton();
      await (
        browserScreen as typeof ChromeBrowserScreen
      ).tapBrowserMoreOptionsButton();

      await (
        browserScreen as typeof ChromeBrowserScreen
      ).tapCloseAllTabsButton();

      await (
        browserScreen as typeof ChromeBrowserScreen
      ).tapConfirmCloseAllTabsButton();
      await (browserScreen as typeof ChromeBrowserScreen).tapNewTabButton();
    }

    await browserScreen.goToAddress(testDappUrl);

    await driver.pause(5000);

    await TestDappScreen.terminate();
    await driver.pause(1000);
    await TestDappScreen.connect();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    }

    await driver.pause(5000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    await TestDappScreen.signTypedDataV3();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    }

    await SignModalComponent.tapSignApproval();

    await TestDappScreen.personalSign();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    }

    await SignModalComponent.tapSignApproval();
  });

  it.skip('Connect to the React JS Example Dapp', async () => {
    await driver.pause(10000);

    // Kill and launch the mobile browser
    const bundleId = BROWSER_BUNDLE_ID;
    await Utils.killApp(bundleId);
    await Utils.launchApp(bundleId);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const reactDappUrl = process.env.REACT_DAPP_URL ?? '';
    await browserScreen.goToAddress(reactDappUrl);

    await CreateReactDappScreen.terminate();
    await browserScreen.refreshPage();

    await CreateReactDappScreen.connect();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    }
    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();
    await ConnectModalComponent.tapConnectApproval();
    await driver.pause(2000);
  });
});
