import { Given, When } from '@wdio/cucumber-framework';
import BrowserScreen from '../screens/android/MobileBrowser';
import DappScreen from '../screens/Dapp/DappScreen';
import DefaultAppsPopup from '../screens/android/DefaultAppsPopup';

Given(/^I open Google Chrome$/u, async () => {
  await BrowserScreen.openBrowser();
});

When(/^I enter the website "([^"]*)?"/u, async (website) => {
  await BrowserScreen.tapAddressBar();
  await BrowserScreen.fillWebsite(website);
});

When(/^I tap the "([^"]*)?" button on the Dapp/u, async (button) => {
  switch (button) {
    case 'Connect':
      await DappScreen.tapSiteConnect();
      break;
    default:
      throw new Error('Condition not found');
  }

  if (await DefaultAppsPopup.isDefaultAppsPopupDisplayed()) {
    await DefaultAppsPopup.selectMetaMask();
  }
});
