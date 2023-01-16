import { Given, When } from '@wdio/cucumber-framework';
import BrowserScreen from '../screens/android/MobileBrowser';
import CreateReactDappScreen from '../screens/Dapp/CreateReactDappScreen';
import DefaultAppsPopup from '../screens/android/DefaultAppsPopup';

Given(/^I open Google Chrome$/u, async () => {
  await new BrowserScreen().launchBrowser();
});

When(/^I enter the website "([^"]*)?"/u, async (website) => {
  await new BrowserScreen().fillWebsite(website);
});

When(/^I tap the "([^"]*)?" button on the Dapp/u, async (button) => {
  switch (button) {
    case 'Connect':
      await new CreateReactDappScreen().tapConnect();
      break;
    default:
      throw new Error('Condition not found');
  }

  if (
    (await driver.isAndroid) &&
    (await DefaultAppsPopup.isDefaultAppsPopupDisplayed())
  ) {
    await DefaultAppsPopup.selectMetaMask();
  }
});
