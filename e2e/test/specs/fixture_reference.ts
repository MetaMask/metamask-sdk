import { driver } from '@wdio/globals';
import connectModalComponent from '../../src/screens/MetaMask/components/ConnectModalComponent';
import ChromeBrowserScreen from '../../src/screens/Android/ChromeBrowserScreen';
import FixtureServer from '../fixtures/FixtureServer';
import LockScreen from '../../src/screens/MetaMask/LockScreen';
import { goBack, launchMetaMaskWithFixture } from '../../src/Utils';
import { METAMASK_BUNDLE_ID, WALLET_PASSWORD } from '../../src/Constants';
import { stopFixtureServer } from '../fixtures/FixtureHelper';
import CreateReactAppDappScreen from '../../src/screens/Dapps/CreateReactAppDappScreen';
import IOSOpenInComponent from '../../src/screens/iOS/components/IOSOpenInComponent';
import SafariBrowserScreen from '../../src/screens/iOS/SafariBrowserScreen';

const fixtureServer = new FixtureServer();

// This test reference will be kept for the work in progress of integrating the
// fixtureServer
describe('Fixture test', () => {
  before(async () => {
    await launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  after(async () => {
    await stopFixtureServer(fixtureServer);
  });

  it('should wait', async () => {
    console.log('Dummy waiting for 50 seconds');
    const browserScreen = driver.isIOS
      ? SafariBrowserScreen
      : ChromeBrowserScreen;

    await browserScreen.goToAddress(
      'https://react.cursedlab.xyz',
      CreateReactAppDappScreen,
    );

    await CreateReactAppDappScreen.connectButton.click();
    await IOSOpenInComponent.tapOpen();
    await connectModalComponent.tapConnectApproval();
    await driver.pause(2000);
    await goBack();
  });
});
