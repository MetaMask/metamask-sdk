import { beforeEachHook, beforeHook } from '../../mocha.hooks';
import { WALLET_PASSWORD } from '@util/Constants';
import { launchApp } from '@util/Utils';
import AndroidSDKDappScreen from '@screens/Dapps/AndroidSDKDappScreen';
import LockScreen from '@screens/MetaMask/LockScreen';
import ConnectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import SendTxModalComponent from '@screens/MetaMask/components/SendTxModalComponent';
import SignModalComponent from '@screens/MetaMask/components/SignModalComponent';
import SwitchNetworkModalComponent from '@screens/MetaMask/components/SwitchNetworkModalComponent';

describe.skip('Android SDK (native) E2E', () => {
  before(async () => {
    await beforeHook();
  });

  beforeEach(async () => {
    await beforeEachHook();
  });

  it('Smoke Testing on the AndroidSDK Test Dapp', async () => {
    await driver.pause(5000);

    await launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');

    await driver.pause(5000);

    await AndroidSDKDappScreen.connect();

    await driver.pause(3000);

    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await ConnectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await ConnectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');
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
});
