import FixtureServer from '../fixtures/FixtureServer';
import LockScreen from '../../src/screens/MetaMask/LockScreen';
import Utils from '../../src/Utils';
import { METAMASK_BUNDLE_ID, WALLET_PASSWORD } from '../../src/Constants';
import { stopFixtureServer } from '../fixtures/FixtureHelper';

const fixtureServer = new FixtureServer();

describe('Fixture test', () => {
  before(async () => {
    // await Utils.launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  after(async () => {
    await stopFixtureServer(fixtureServer);
  });

  it('should wait', async () => {
    console.log('Dummy waiting for 50 seconds');
    await driver.pause(10000);
    await driver.pause(10000);
    await driver.pause(10000);
  });
});
