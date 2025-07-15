import { WALLET_PASSWORD } from '@util/constants';
import { launchApp } from '@util/utils';
import androidSDKDappScreen from '@screens/Dapps/AndroidSDKDappScreen';
import lockScreen from '@screens/MetaMask/LockScreen';
import connectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import sendTxModalComponent from '@screens/MetaMask/components/SendTxModalComponent';
import signModalComponent from '@screens/MetaMask/components/SignModalComponent';
import switchNetworkModalComponent from '@screens/MetaMask/components/SwitchNetworkModalComponent';

// THIS SWUITE IS CURRENTLY NOT IN USE AS ANDROID SDK WAS DEPRECATED
describe.skip('Android SDK (native) E2E', () => {
  it('Smoke Testing on the AndroidSDK Test Dapp', async () => {
    await driver.pause(5000);

    await launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');

    await driver.pause(5000);

    await androidSDKDappScreen.connect();

    await driver.pause(3000);

    await lockScreen.unlockMMifLocked(WALLET_PASSWORD);

    await expect(
      await connectModalComponent.connectApprovalButton,
    ).toBeDisplayed();

    await connectModalComponent.tapConnectApproval();

    if (driver.isIOS) {
      await driver.pause(1000);
      await launchApp(process.env.ANDROID_SDK_TEST_BUNDLE_ID ?? '');
    }

    await driver.pause(5000);

    await androidSDKDappScreen.sign();
    await androidSDKDappScreen.sign2();

    await signModalComponent.tapSignApproval();

    await androidSDKDappScreen.goBack();

    await androidSDKDappScreen.batchSigning();
    await androidSDKDappScreen.batchSigning();

    await signModalComponent.tapSignApproval();
    await signModalComponent.tapSignApproval();

    await androidSDKDappScreen.goBack();

    await androidSDKDappScreen.sendTransaction();
    await androidSDKDappScreen.sendTransaction2();

    await sendTxModalComponent.reject();

    await androidSDKDappScreen.goBack();

    await androidSDKDappScreen.switchChain();
    await androidSDKDappScreen.switchChain2();

    await switchNetworkModalComponent.switchNetwork();

    await driver.pause(1000);
  });
});
