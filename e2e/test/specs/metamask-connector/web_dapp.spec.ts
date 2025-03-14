import FixtureServer from '@fixtures/FixtureServer';
import {
  deviceOpenDeeplinkWithMetaMask,
  goBack,
  killApp,
  launchMetaMaskWithFixture,
  navigateToWebMobileDapp,
  refreshBrowser,
} from '@util/Utils';
import ConnectModalComponent from '@screens/MetaMask/components/ConnectModalComponent';
import PersonalSignConfirmationComponent from '@screens/MetaMask/components/PersonalSignConfirmationComponent';
import LockScreen from '@screens/MetaMask/LockScreen';
import PlaygroundNextDappScreen from '@screens/Dapps/PlaygroundNextDappScreen';
import {
  METAMASK_BUNDLE_ID,
  WALLET_PASSWORD,
} from '../../../src/util/Constants';

let playgroundNextDappUrl: string;
const fixtureServer = new FixtureServer();

describe('MetaMask Connector Playground dapp', () => {
  before(async () => {
    playgroundNextDappUrl = process.env.PLAYGROUND_NEXT_DAPP_URL ?? '';
    expect(playgroundNextDappUrl.length).toBeGreaterThan(0);

    await launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  it('connect with a cold start state', async () => {
    await navigateToWebMobileDapp(
      playgroundNextDappUrl,
      PlaygroundNextDappScreen,
    );
    // Start with a cold start
    await killApp(METAMASK_BUNDLE_ID);
    await refreshBrowser();

    await PlaygroundNextDappScreen.connect();
    await deviceOpenDeeplinkWithMetaMask();

    await LockScreen.unlockMM(WALLET_PASSWORD);

    await ConnectModalComponent.tapConnectApproval();

    await goBack();

    expect(await PlaygroundNextDappScreen.isDappConnected()).toBe(true);
  });

  // Boilerplate for the next test
  it('call personal_sign with a cold start state', async () => {
    const personalSignMessage = 'Hello, world!';

    // Start with a cold start
    await killApp(METAMASK_BUNDLE_ID);

    await PlaygroundNextDappScreen.tapPersonalSignButton();
    await deviceOpenDeeplinkWithMetaMask();
    await LockScreen.unlockMM(WALLET_PASSWORD);

    expect(
      await PersonalSignConfirmationComponent.isPersonalSignComponentDisplayed(),
    ).toBe(true);

    expect(
      await PersonalSignConfirmationComponent.messageText.getText(),
    ).toContain(personalSignMessage);

    await PersonalSignConfirmationComponent.tapSignButton();
    await goBack();

    // TODO: Assert personalSign contents
  });
});
