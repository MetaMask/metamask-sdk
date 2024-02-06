import { BROWSER_BUNDLE_ID, WALLET_PASSWORD } from '../../src/Constants';
import Utils from '../../src/Utils';
import ChromeBrowserScreen from '../../src/screens/Android/ChromeBrowserScreen';
import AndroidOpenWithComponent from '../../src/screens/Android/components/AndroidOpenWithComponent';
import ReactNativeDappScreen from '../../src/screens/Dapps/ReactNativeDappScreen';
import SdkPlaygroundDappScreen from '../../src/screens/Dapps/SdkPlaygroundDappScreen';
import AndroidSDKDappScreen from '../../src/screens/Dapps/AndroidSDKDappScreen';
import TestDappScreen from '../../src/screens/Dapps/TestDappScreen';
import Web3OnBoardDappScreen from '../../src/screens/Dapps/Web3OnBoardDappScreen';
import LockScreen from '../../src/screens/MetaMask/LockScreen';
import SettingsScreen from '../../src/screens/MetaMask/SettingsScreen';
import BottomNavigationComponent from '../../src/screens/MetaMask/components/BottomNavigationComponent';
import ConnectModalComponent from '../../src/screens/MetaMask/components/ConnectModalComponent';
import NetworkSwitchedModalComponent from '../../src/screens/MetaMask/components/NetworkSwitchedModalComponent';
import SendTxModalComponent from '../../src/screens/MetaMask/components/SendTxModalComponent';
import SignModalComponent from '../../src/screens/MetaMask/components/SignModalComponent';
import SwitchNetworkModalComponent from '../../src/screens/MetaMask/components/SwitchNetworkModalComponent';
import SafariBrowserScreen from '../../src/screens/iOS/SafariBrowserScreen';
import IOSOpenInComponent from '../../src/screens/iOS/components/IOSOpenInComponent';
import { beforeEachHook, beforeHook } from '../mocha.hooks';

describe('JS SDK Connection', () => {
  before(async () => {
    await beforeHook();
  });

  beforeEach(async () => {
    await beforeEachHook();
  });

  it('Connect to the Web3onboard Dapp', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await Utils.killApp(BROWSER_BUNDLE_ID);
    await Utils.launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.WEB3_ON_BOARD_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl);

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
      await Utils.launchApp(BROWSER_BUNDLE_ID);
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

  it('Connect to the SDK Playground Dapp', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await Utils.killApp(BROWSER_BUNDLE_ID);
    await Utils.launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.SDK_PLAYGROUND_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl);

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
      await Utils.launchApp(BROWSER_BUNDLE_ID);
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
      await Utils.launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.switchToGoerliNetwork();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SwitchNetworkModalComponent.switchNetwork();

    if (driver.isAndroid) {
      await SwitchNetworkModalComponent.switchNetwork();
    }

    if (driver.isIOS) {
      await NetworkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);
      await Utils.launchApp(BROWSER_BUNDLE_ID);
    }

    if (driver.isAndroid) {
      await driver.pause(2000);

      await Utils.launchMetaMask();

      await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

      await driver.pause(3000);

      await NetworkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);

      await Utils.launchApp(BROWSER_BUNDLE_ID);
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

    if (driver.isAndroid) {
      await SignModalComponent.tapSignApproval();
    }

    if (driver.isIOS) {
      await driver.pause(1000);
      await Utils.launchApp(BROWSER_BUNDLE_ID);
    }

    await SdkPlaygroundDappScreen.sendTransaction();

    if (driver.isAndroid) {
      await AndroidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await IOSOpenInComponent.tapOpen();
    }

    await SendTxModalComponent.reject();

    if (driver.isIOS) {
      await driver.pause(1000);
      await Utils.launchApp(BROWSER_BUNDLE_ID);
    }
  });

  it('Connect to the ReactNativeDemo Dapp', async () => {
    await driver.pause(5000);

    await Utils.launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');

    await driver.pause(15000);

    await ReactNativeDappScreen.terminate();

    await ReactNativeDappScreen.connect();

    await driver.pause(5000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await Utils.launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');
    }

    await driver.pause(5000);
    await ReactNativeDappScreen.sign();

    await driver.pause(5000);
    await SignModalComponent.tapSignApproval();
  });

  it('Connect to the AndroidSDK Test Dapp', async () => {
    await driver.pause(5000);

    await Utils.launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');

    await driver.pause(15000);

    await AndroidSDKDappScreen.connect();

    await driver.pause(5000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await Utils.launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');
    }

    await driver.pause(5000);

    await AndroidSDKDappScreen.sign();
    await AndroidSDKDappScreen.sign2();

    await SignModalComponent.tapSignApproval();

    await AndroidSDKDappScreen.goBack();

    await AndroidSDKDappScreen.batchSigning();
    await AndroidSDKDappScreen.batchSigning();

    await SignModalComponent.tapSignApproval();
    await SignModalComponent.tapSignApproval();
    await SignModalComponent.tapSignApproval();

    await AndroidSDKDappScreen.goBack();

    await AndroidSDKDappScreen.sendTransaction();
    await AndroidSDKDappScreen.sendTransaction2();

    await SendTxModalComponent.reject();

    await AndroidSDKDappScreen.goBack();

    await AndroidSDKDappScreen.switchChain();
    await AndroidSDKDappScreen.switchChain2();

    await SwitchNetworkModalComponent.switchNetwork();

    await driver.pause(1000);
  });

  it.skip('Clear all connections', async () => {
    // TODO: Make this test work

    await driver.pause(5000);
    const metamaskBundleId = process.env.BUNDLE_ID as string;
    await Utils.killApp(metamaskBundleId);

    await Utils.launchMetaMask();

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
    await Utils.killApp(BROWSER_BUNDLE_ID);
    await Utils.launchApp(BROWSER_BUNDLE_ID);

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
