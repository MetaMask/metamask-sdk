import { Given, When, Then } from '@wdio/cucumber-framework';
import Gestures from '../utils/Gestures';
import ConnectDappPopup from '../screens/MetaMask/Components/ConnectDappPopup';
import GetStartedScreen from '../screens/MetaMask/GetStartedScreen';
import WalletSetupScreen from '../screens/MetaMask/WalletSetupScreen';
import OptinMetricsScreen from '../screens/MetaMask/OptinMetricsScreen';
import ImportFromSeedScreen from '../screens/MetaMask/ImportFromSeedScreen';
import SecurityUpdatesScreen from '../screens/MetaMask/SecurityUpdatesScreen';

Given(/^The MetaMask mobile app is installed$/u, async () => {
  /** This is automatically done by the automation framework **/
});

When(/^I open the MetaMask mobile app$/u, async () => {
  /** This is automatically done by the automation framework **/
});

// And I tap "Import Wallet" on MetaMask
When(/^I tap "([^"]*)?" on MetaMask/u, async (text) => {
  switch (text) {
    case 'Get Started':
      await driver.pause(7000);
      await GetStartedScreen.tapGetStarted();
      break;
    case 'Import Wallet':
      // await driver.pause(7000); // TODO: Needs a smarter set timeout
      await WalletSetupScreen.tapImportWithSRP();
      break;
    case 'Dont Share Analytics':
      await Gestures.swipeByPercentage({ x: 50, y: 80 }, { x: 50, y: 10 });
      await OptinMetricsScreen.tapNoThanksOptinMetrics();
      break;
    case 'Import':
      await ImportFromSeedScreen.tapImportButton();
      break;
    case 'No Security Updates':
      await SecurityUpdatesScreen.tapNoThanksSecutityUpdates();
      break;
    default:
      throw new Error('Condition not found');
  }
});

When(
  /^I tap the "([^"]*)?" buttom on the MetaMask bottom prompt/u,
  async (button) => {
    switch (button) {
      case 'Approve':
        await ConnectDappPopup.tapConnect();
        break;
      case 'Reject':
        await ConnectDappPopup.tapCancel();
        break;
      default:
        throw new Error('Condition not found');
    }
  },
);

When(/^I fill the "([^"]*)?" with "([^"]*)?"/u, async (field, value) => {
  const srp =
    process.env.SRP ||
    'test test test test test test test test test test test test';
  switch (field) {
    case 'Secret Recovery Phrase':
      await ImportFromSeedScreen.fillSrpField(srp);
      break;
    case 'FirstPassword':
      await ImportFromSeedScreen.fillFirstPasswordInput(value);
      break;
    case 'SecondPassword':
      await ImportFromSeedScreen.fillSecondPasswordInput(value);
      break;
    default:
      throw new Error('Condition not found');
  }
});

Then(/^I am routed to MetaMask and I see the bottom prompt/u, async () => {
  // await driver.pause(7000);
  expect(await ConnectDappPopup.isConnectPopupDisplayed()).toBe(true);
});
