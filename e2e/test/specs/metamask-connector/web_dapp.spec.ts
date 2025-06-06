import FixtureServer from '@fixtures/FixtureServer';
import {
  deviceOpenDeeplinkWithMetaMask,
  goBack,
  killApp,
  launchMetaMaskWithFixture,
  navigateToWebMobileDapp,
  refreshBrowser,
  withMobileAction,
  withWebAction,
} from '@util/Utils';
import ConnectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import LockScreen from '@screens/MetaMask/LockScreen';
import MetaMaskSDKTestDappScreen from '@screens/Dapps/MetaMaskSDKTestDappScreen';
import {
  METAMASK_BUNDLE_ID,
  WALLET_PASSWORD,
} from '../../../src/util/Constants';

let metamaskSDKTestDappUrl: string;
const fixtureServer = new FixtureServer();

describe('MetaMask Connector Playground dapp', () => {
  before(async () => {
    metamaskSDKTestDappUrl = process.env.METAMASK_TEST_DAPP_URL ?? '';
    expect(metamaskSDKTestDappUrl.length).toBeGreaterThan(0);

    await launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  it('connect with a cold start state', async () => {
    await navigateToWebMobileDapp(
      metamaskSDKTestDappUrl,
      MetaMaskSDKTestDappScreen,
    );
    // Start with a cold start
    await killApp(METAMASK_BUNDLE_ID);
    await refreshBrowser();

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      await MetaMaskSDKTestDappScreen.connect();
    });

    await withMobileAction(async () => {
      await deviceOpenDeeplinkWithMetaMask();
      await LockScreen.unlockMM(WALLET_PASSWORD);
      await ConnectModalComponent.tapConnectApproval();
      await goBack();
    });

    await withWebAction(metamaskSDKTestDappUrl, async () => {
      expect(await MetaMaskSDKTestDappScreen.isDappConnected()).toBe(true);
    });
  });
});
