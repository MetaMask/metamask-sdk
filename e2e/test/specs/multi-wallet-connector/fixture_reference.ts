import FixtureServer from '@fixtures/FixtureServer';
import { stopFixtureServer } from '@fixtures/FixtureHelper';
import LockScreen from '@screens/MetaMask/LockScreen';
import { METAMASK_BUNDLE_ID, WALLET_PASSWORD } from '@util/constants';
import { launchMetaMaskWithFixture } from '@util/utils';

const fixtureServer = new FixtureServer();

// This test reference will be kept for the work in progress of integrating the
// fixtureServer
describe.skip('Fixture test', () => {
  before(async () => {
    await launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  after(async () => {
    await stopFixtureServer(fixtureServer);
  });

  it('should pass', async () => {
    expect(true).toBe(true);
  });
});
