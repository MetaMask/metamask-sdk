import { afterEachHook, beforeEachHook, beforeHook } from '../mocha.hooks';
import Utils from '../../src/Utils';
import { Browsers, WALLET_PASSWORD } from '../../src/Constants';
import SafariBrowserScreen from '../../src/screens/iOS/SafariBrowserScreen';
import ChromeBrowserScreen from '../../src/screens/Android/ChromeBrowserScreen';
import CreateReactDappScreen from '../../src/screens/Dapps/CreateReactDappScreen';
import AndroidOpenWithComponent from '../../src/screens/Android/components/AndroidOpenWithComponent';
import ConnectModalComponent from '../../src/screens/MetaMask/components/ConnectModalComponent';
import LockScreen from '../../src/screens/MetaMask/LockScreen';

describe('JS SDK Connection', () => {
  before(async () => {
    await beforeHook();
  });

  beforeEach(async () => {
    await beforeEachHook();
  });

  afterEach(async () => {
    await afterEachHook();
  });

  it('Connect to the React JS Example Dapp', async () => {
    // Kill and launch the mobile browser
    const bundleId = driver.isIOS ? Browsers.SAFARI : Browsers.CHROME;
    await Utils.killApp(bundleId);
    await Utils.launchApp(bundleId);

    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    // Get and navigate to the Dapp URL
    const reactDappUrl = process.env.REACT_DAPP_URL ?? 'https://google.com';
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
