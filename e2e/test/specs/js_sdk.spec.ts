import { beforeEachHook, beforeHook } from '../mocha.hooks';
import { BROWSER_BUNDLE_ID, WALLET_PASSWORD } from '@/util/Constants';
import { killApp, launchApp, launchMetaMask } from '@/util/Utils';
import ChromeBrowserScreen from '@/screens/Android/ChromeBrowserScreen';
import AndroidOpenWithComponent from '@/screens/Android/components/AndroidOpenWithComponent';
import ReactNativeDappScreen from '@/screens/Dapps/ReactNativeDappScreen';
import SdkPlaygroundDappScreen from '@/screens/Dapps/SdkPlaygroundDappScreen';
import TestDappScreen from '@/screens/Dapps/TestDappScreen';
import Web3OnBoardDappScreen from '@/screens/Dapps/Web3OnBoardDappScreen';
import LockScreen from '@/screens/MetaMask/LockScreen';
import SettingsScreen from '@/screens/MetaMask/SettingsScreen';
import BottomNavigationComponent from '@/screens/MetaMask/components/BottomNavigationComponent';
import ConnectModalComponent from '@/screens/MetaMask/components/ConnectModalComponent';
import NetworkSwitchedModalComponent from '@/screens/MetaMask/components/NetworkSwitchedModalComponent';
import SendTxModalComponent from '@/screens/MetaMask/components/SendTxModalComponent';
import SignModalComponent from '@/screens/MetaMask/components/SignModalComponent';
import SwitchNetworkModalComponent from '@/screens/MetaMask/components/SwitchNetworkModalComponent';
import SafariBrowserScreen from '@/screens/iOS/SafariBrowserScreen';
import IOSOpenInComponent from '@/screens/iOS/components/IOSOpenInComponent';
import DevnextJSDappScreen from '@/screens/Dapps/DevnextJSDappScreen';

/*
 * @deprecated
 *
 * This test suite is deprecated and will be removed in the future.
 * It is currently being kept for reference purposes.
 *
 * The tests within this suite were originally designed to test the MetaMask
 * JavaScript SDK. However, the current implementation of the SDK has changed,
 * and the tests are no longer applicable.
 *
 */
describe.skip('JS SDK E2E', () => {
  before(async () => {
    await beforeHook();
  });

  beforeEach(async () => {
    await beforeEachHook();
  });

  it('E2E on devnext', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    const devnextDappUrl = process.env.DEVNEXT_DAPP_URL ?? '';

    await browserScreen.goToAddress(devnextDappUrl, DevnextJSDappScreen);
    // TODO: Make the devnext pom and continue writing tests

    await driver.pause(5000);
  });

  // Tests from the first iteration are now being skipped
  it.skip('Connect to the Web3onboard Dapp', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.WEB3_ON_BOARD_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl, DevnextJSDappScreen);

    await Web3OnBoardDappScreen.connect();

    await Web3OnBoardDappScreen.tapMetaMaskConnectButton();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await driver.pause(5000);
    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await driver.pause(5000);
    await Web3OnBoardDappScreen.sign();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SignModalComponent.tapSignApproval();
  });

  it.skip('Connect to the SDK Playground Dapp', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.SDK_PLAYGROUND_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl, DevnextJSDappScreen);

    await SdkPlaygroundDappScreen.terminate();

    await SdkPlaygroundDappScreen.connect();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await driver.pause(5000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.signTypedDataV4();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SignModalComponent.tapSignApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.switchToGoerliNetwork();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SwitchNetworkModalComponent.switchNetwork();

    if (driver.isIOS) {
      await NetworkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    if (driver.isAndroid) {
      await driver.pause(2000);

      await launchMetaMask();

      await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

      await driver.pause(3000);

      await NetworkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);

      await launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.sendBatchRpcCalls();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SignModalComponent.tapSignApproval();

    await SignModalComponent.tapSignApproval();

    await SignModalComponent.tapSignApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.sendTransaction();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SendTxModalComponent.reject();

    await driver.pause(1000);

    if (driver.isIOS) {
      await launchApp(BROWSER_BUNDLE_ID);
    }
  });

  it.skip('Connect to the ReactNativeDemo Dapp', async () => {
    await driver.pause(5000);

    await launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');

    await driver.pause(15000);

    await ReactNativeDappScreen.connect();

    await driver.pause(5000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');
    }

    await driver.pause(5000);
    await ReactNativeDappScreen.sign();

    await driver.pause(5000);
    await SignModalComponent.tapSignApproval();
  });

  it.skip('Clear all connections', async () => {
    // TODO: Make this test work

    await driver.pause(5000);
    const metamaskBundleId = process.env.BUNDLE_ID as string;
    await killApp(metamaskBundleId);

    await launchMetaMask();

    await driver.pause(5000);
    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
    await driver.pause(5000);

    try {
      await BottomNavigationComponent.tapSettingsButton();
      await SettingsScreen.clearAllConnections();
      await BottomNavigationComponent.tapHomeButton();
    } catch (e) {
      console.log('No Connections to clear', e.message);
    }
  });

  it.skip('Connect to the Test-Dapp', async () => {
    await driver.pause(10000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

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

    await browserScreen.goToAddress(testDappUrl, DevnextJSDappScreen);

    await driver.pause(5000);

    await TestDappScreen.terminate();
    await driver.pause(1000);
    await TestDappScreen.connect();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
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
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SignModalComponent.tapSignApproval();

    await TestDappScreen.personalSign();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await driver.pause(5000);

    await SignModalComponent.tapSignApproval();
    await SignModalComponent.tapSignApproval();

    await driver.pause(2000);
  });
});
