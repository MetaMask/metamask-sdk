import { Given, When, Then } from '@wdio/cucumber-framework';
import BootstrapScreen from '../screens/MetaMask/Bootstrap';
import ConnectDappPopup from '../screens/MetaMask/ConnectDappPopup';
import Gestures from '../utils/Gestures';

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
      await BootstrapScreen.tapGetStarted();
      break;
    case 'Import Wallet':
      // await driver.pause(7000); // TODO: Needs a smarter set timeout
      await BootstrapScreen.tapImportWithSRP();
      break;
    case 'Dont Share Analytics':
      await Gestures.swipe({ x: 200, y: 1000 }, { x: 200, y: 10 });
      await BootstrapScreen.tapNoThanksOptinMetrics();
      break;
    case 'Import':
      await BootstrapScreen.tapImportButton();
      break;
    case 'No Security Updates':
      await BootstrapScreen.tapNoThanksSecutityUpdates();
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
      await BootstrapScreen.fillSrpField(srp);
      break;
    case 'FirstPassword':
      await BootstrapScreen.fillFirstPasswordInput(value);
      break;
    case 'SecondPassword':
      await BootstrapScreen.fillSecondPasswordInput(value);
      break;
    default:
      throw new Error('Condition not found');
  }
});

Then(/^I am routed to MetaMask and I see the bottom prompt/u, async () => {
  // await driver.pause(7000);
  expect(await ConnectDappPopup.isConnectPopupDisplayed()).toBe(true);
});
