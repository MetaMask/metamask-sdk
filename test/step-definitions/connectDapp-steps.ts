import { Given, When, Then } from '@wdio/cucumber-framework';
import ConnectDappPopup from '../screens/components/ConnectDappPopup';
import PermissionsPopup from '../screens/components/PermissionsPopup';
import DappScreen from '../screens/DappScreen';

Given(/^I open Google Chrome$/u, async () => {
  await browser.activateApp('com.android.chrome');
  if (await PermissionsPopup.isPermissionsPopupDisplayed()) {
    await PermissionsPopup.tapChromePermission();
  }
});

When(/^I enter the website "([^"]*)?"/u, async (website) => {
  const browserUrlBar = $('id=com.android.chrome:id/url_bar');
  await browserUrlBar.click();
  await browserUrlBar.setValue(website);
  await driver.pressKeyCode(66);
});

Then(/^I tap "([^"]*)?" on the permission request/u, async (button) => {
  switch (button) {
    case 'Connect':
      await ConnectDappPopup.tapConnect();
      break;
    default:
      await ConnectDappPopup.tapCancel();
      break;
  }
});

Then(
  'the {string} button should be {string}',
  async (button: string, isClickable: string) => {
    let buttonElementClickable: boolean;
    switch (button) {
      case 'DappConnect':
        buttonElementClickable =
          await DappScreen.isDappConnectButtonClickable();
        break;
      default:
        throw new Error(`Button not found ${button}`);
    }
    const isClickableBool = isClickable === 'Clickable';
    expect(buttonElementClickable).toBe(isClickableBool);
  },
);
