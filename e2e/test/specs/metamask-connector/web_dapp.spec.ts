import FixtureServer from '@fixtures/FixtureServer';
import {
  goBack,
  killApp,
  launchMetaMaskWithFixture,
  navigateToWebMobileDapp,
  refreshBrowser,
  withMobileAction,
  withWebAction,
} from '@util/utils';
import { deviceOpenDeeplinkWithMetaMask } from '@test/ViewHelpers';
import connectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import lockScreen from '@screens/MetaMask/LockScreen';
import metaMaskSDKTestDappScreen from '@screens/Dapps/MetaMaskSDKTestDappScreen';
import {
  METAMASK_BUNDLE_ID,
  WALLET_PASSWORD,
} from '../../../src/util/constants';

let metamaskSDKTestDappUrl: string;
const fixtureServer = new FixtureServer();

describe('MetaMask Connector Playground dapp', () => {
  before(async () => {
    metamaskSDKTestDappUrl = process.env.METAMASK_TEST_DAPP_URL ?? '';
    expect(metamaskSDKTestDappUrl.length).toBeGreaterThan(0);

    await launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await lockScreen.unlockMM(WALLET_PASSWORD);
  });

  it('connects with a cold start state', async () => {
    await navigateToWebMobileDapp(
      metamaskSDKTestDappUrl,
      metaMaskSDKTestDappScreen,
    );
    // Start with a cold start
    await killApp(METAMASK_BUNDLE_ID);
    await refreshBrowser();

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      await metaMaskSDKTestDappScreen.connect();
    });

    await withMobileAction(async () => {
      await deviceOpenDeeplinkWithMetaMask();
      await lockScreen.unlockMM(WALLET_PASSWORD);
      await connectModalComponent.tapConnectApproval();
      await goBack();
    });

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      expect(await metaMaskSDKTestDappScreen.isDappConnected()).toBe(true);
    });
  });

  it.skip('calls personal_sign with a cold start state', async () => {
    // Start with a cold start
    await killApp(METAMASK_BUNDLE_ID);
    await refreshBrowser();

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      await metaMaskSDKTestDappScreen.tapPersonalSignButton();
    });

    await withMobileAction(async () => {
      await deviceOpenDeeplinkWithMetaMask();
      await lockScreen.unlockMM(WALLET_PASSWORD);
      await connectModalComponent.tapConnectApproval();
      await goBack();
    });

    await driver.pause(10000);

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      expect(await metaMaskSDKTestDappScreen.isDappConnected()).toBe(true);
    });
  });
});
