import { Given, When, Then } from '@wdio/cucumber-framework';
import WelcomeToMetaMaskScreen from '../screens/OnboardingScreen';
import DappScreen from '../screens/DappScreen';

Given(/^The MetaMask mobile app is installed$/u, async () => {
  /** This is automatically done by the automation framework **/
});

When(/^I open the MetaMask mobile app$/u, async () => {
  /** This is automatically done by the automation framework **/
});

When(/^I tap on "([^"]*)?"/u, async (text) => {
  switch (text) {
    case 'Get Started':
      await driver.pause(7000); // TODO: Needs a smarter set timeout
      await WelcomeToMetaMaskScreen.tapGetStarted();
      break;
    case 'Create a new Wallet':
      await WelcomeToMetaMaskScreen.tapCreateWallet();
      break;
    case 'No Thanks':
      await WelcomeToMetaMaskScreen.tapNoThanksButton();
      break;
    case 'Create password':
      await WelcomeToMetaMaskScreen.tapCreatePasswordButton();
      break;
    case 'Remind me later':
      await WelcomeToMetaMaskScreen.tapRemindMeLater();
      break;
    case 'Skip':
      await WelcomeToMetaMaskScreen.tapSkipConfirmationButton();
      break;
    case 'DappConnect':
      await DappScreen.tapSiteConnect();
      break;
    default:
      throw new Error('Condition not found');
  }
});

Then(/^I should see the "([^"]*)?" screen/u, async (text) => {
  switch (text) {
    case 'MetaMask Main':
      // eslint-disable-next-line no-case-declarations
      const el = await $('~navbar-title-network');
      expect(await el.isDisplayed()).toBe(true);
      await driver.pressKeyCode(260);

      break;
    default:
      throw new Error(`Screen not found ${text}`);
  }
});

When(/^I fill the same Password$/u, async () => {
  await WelcomeToMetaMaskScreen.fillPassword();
});

When(/^I tap the "([^"]*)?" checkbox$/u, async (text) => {
  switch (text) {
    case 'Accept':
      await WelcomeToMetaMaskScreen.tapCheckboxConfirmation();
      break;
    case 'Skip Security':
      await WelcomeToMetaMaskScreen.tapConfirmSkipAccountSecurityCheckbox();
      break;
    default:
      throw new Error('invalid checkbox in feature file');
  }
});
