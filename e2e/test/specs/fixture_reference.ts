import FixtureServer from '../fixtures/FixtureServer';
import FixtureExpressServer from '../fixtures/FixtureExpressServer';
import LockScreen from '../../src/screens/MetaMask/LockScreen';
import Utils from '../../src/Utils';
import { METAMASK_BUNDLE_ID, WALLET_PASSWORD } from '../../src/Constants';
import { stopFixtureServer } from '../fixtures/FixtureHelper';
import { driver } from '@wdio/globals';
import axios from 'axios';
import { FixtureBuilder } from '../fixtures/FixtureBuilder';

const fixtureServer = new FixtureServer();

describe('Fixture test', () => {
  before(async () => {
    await Utils.launchMetaMaskWithFixture(fixtureServer, METAMASK_BUNDLE_ID);
    // const fixture = new FixtureBuilder().build();
    // try {
    //   await axios.post('http://localhost:12345/state', fixture);
    //   console.log('Fixture state sent successfully');
    // } catch (error) {
    //   console.error('Failed to send fixture state:', error);
    //   throw error;
    // }
    await LockScreen.unlockMM(WALLET_PASSWORD);
  });

  after(async () => {
    // await stopFixtureServer(fixtureServer);
  });

  it('should wait', async () => {
    console.log('Dummy waiting for 50 seconds');
    await driver.pause(10000);
    await driver.pause(10000);
    await driver.pause(10000);
  });
});
