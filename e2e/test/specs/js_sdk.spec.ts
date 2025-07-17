import { BROWSER_BUNDLE_ID, WALLET_PASSWORD } from '@util/constants';
import { killApp, launchApp, launchMetaMask } from '@util/utils';
import chromeBrowserScreen from '@screens/Android/ChromeBrowserScreen';
import androidOpenWithComponent from '@screens/Android/components/AndroidOpenWithComponent';
import reactNativeDappScreen from '@screens/Dapps/ReactNativeDappScreen';
import sdkPlaygroundDappScreen from '@screens/Dapps/SdkPlaygroundDappScreen';
import testDappScreen from '@screens/Dapps/TestDappScreen';
import web3OnBoardDappScreen from '@screens/Dapps/Web3OnBoardDappScreen';
import lockScreen from '@screens/MetaMask/LockScreen';
import settingsScreen from '@screens/MetaMask/SettingsScreen';
import bottomNavigationComponent from '@screens/MetaMask/components/BottomNavigationComponent';
import connectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import networkSwitchedModalComponent from '@screens/MetaMask/components/NetworkSwitchedModalComponent';
import sendTxModalComponent from '@screens/MetaMask/components/SendTxModalComponent';
import signModalComponent from '@screens/MetaMask/components/SignModalComponent';
import switchNetworkModalComponent from '@screens/MetaMask/components/SwitchNetworkModalComponent';
import safariBrowserScreen from '@screens/iOS/SafariBrowserScreen';
import iosOpenInComponent from '@screens/iOS/components/IOSOpenInComponent';
import devnextJSDappScreen from '@screens/Dapps/DevnextJSDappScreen';

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
  it('E2E on devnext', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? safariBrowserScreen
      : chromeBrowserScreen;

    const devnextDappUrl = process.env.DEVNEXT_DAPP_URL ?? '';

    await browserScreen.goToAddress(devnextDappUrl, devnextJSDappScreen);
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
      ? safariBrowserScreen
      : chromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.WEB3_ON_BOARD_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl, web3OnBoardDappScreen);

    await web3OnBoardDappScreen.connect();

    await web3OnBoardDappScreen.tapMetaMaskConnectButton();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await driver.pause(5000);
    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await connectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await connectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await driver.pause(5000);
    await web3OnBoardDappScreen.sign();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await signModalComponent.tapSignApproval();
  });

  it.skip('Connect to the SDK Playground Dapp', async () => {
    await driver.pause(5000);

    // Kill and launch the mobile browser
    await killApp(BROWSER_BUNDLE_ID);
    await launchApp(BROWSER_BUNDLE_ID);

    const browserScreen = driver.isIOS
      ? safariBrowserScreen
      : chromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const dappUrl = process.env.SDK_PLAYGROUND_DAPP_URL ?? '';

    await browserScreen.goToAddress(dappUrl, devnextJSDappScreen);

    await sdkPlaygroundDappScreen.terminate();

    await sdkPlaygroundDappScreen.connect();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await driver.pause(5000);

    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await connectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await connectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await sdkPlaygroundDappScreen.signTypedDataV4();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await signModalComponent.tapSignApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await sdkPlaygroundDappScreen.switchToGoerliNetwork();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await switchNetworkModalComponent.switchNetwork();

    if (driver.isIOS) {
      await networkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    if (driver.isAndroid) {
      await driver.pause(2000);

      await launchMetaMask();

      await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

      await driver.pause(3000);

      await networkSwitchedModalComponent.tapGotItButton();

      await driver.pause(1000);

      await launchApp(BROWSER_BUNDLE_ID);
    }

    await sdkPlaygroundDappScreen.sendBatchRpcCalls();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await signModalComponent.tapSignApproval();

    await signModalComponent.tapSignApproval();

    await signModalComponent.tapSignApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(BROWSER_BUNDLE_ID);
    }

    await sdkPlaygroundDappScreen.sendTransaction();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await sendTxModalComponent.reject();

    await driver.pause(1000);

    if (driver.isIOS) {
      await launchApp(BROWSER_BUNDLE_ID);
    }
  });

  it.skip('Connect to the ReactNativeDemo Dapp', async () => {
    await driver.pause(5000);

    await launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');

    await driver.pause(15000);

    await reactNativeDappScreen.connect();

    await driver.pause(5000);

    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await connectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await connectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(process.env.RN_TEST_APP_BUNDLE_ID ?? '');
    }

    await driver.pause(5000);
    await reactNativeDappScreen.sign();

    await driver.pause(5000);
    await signModalComponent.tapSignApproval();
  });

  it.skip('Clear all connections', async () => {
    // TODO: Make this test work

    await driver.pause(5000);
    const metamaskBundleId = process.env.BUNDLE_ID as string;
    await killApp(metamaskBundleId);

    await launchMetaMask();

    await driver.pause(5000);
    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);
    await driver.pause(5000);

    try {
      await bottomNavigationComponent.tapSettingsButton();
      await settingsScreen.clearAllConnections();
      await bottomNavigationComponent.tapHomeButton();
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
      ? safariBrowserScreen
      : chromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const testDappUrl = process.env.TEST_DAPP_URL ?? '';

    if (driver.isAndroid) {
      await (browserScreen as typeof chromeBrowserScreen).tapSwitchTabsButton();
      await (
        browserScreen as typeof chromeBrowserScreen
      ).tapBrowserMoreOptionsButton();

      await (
        browserScreen as typeof chromeBrowserScreen
      ).tapCloseAllTabsButton();

      await (
        browserScreen as typeof chromeBrowserScreen
      ).tapConfirmCloseAllTabsButton();
      await (browserScreen as typeof chromeBrowserScreen).tapNewTabButton();
    }

    await browserScreen.goToAddress(testDappUrl, devnextJSDappScreen);

    await driver.pause(5000);

    await testDappScreen.terminate();
    await driver.pause(1000);
    await testDappScreen.connect();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await driver.pause(5000);

    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await connectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await connectModalComponent.tapConnectApproval();

    await testDappScreen.signTypedDataV3();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await signModalComponent.tapSignApproval();

    await testDappScreen.personalSign();

    if (driver.isAndroid) {
      await androidOpenWithComponent.tapOpenWithMetaMaskQA();
    } else if (driver.isIOS) {
      await iosOpenInComponent.tapOpen();
    }

    await driver.pause(5000);

    await signModalComponent.tapSignApproval();
    await signModalComponent.tapSignApproval();

    await driver.pause(2000);
  });
});
