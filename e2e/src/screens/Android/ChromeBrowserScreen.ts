import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { MobileBrowser } from '@screens/interfaces/MobileBrowser';
import { Dapp } from '@screens/interfaces/Dapp';
import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector } from '@util/selectors';
import { Browsers } from '@util/constants';

class ChromeBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndClassName(
          'android.widget.EditText',
        ),
      }),
    );
  }

  // 3 dots on the top
  get browserMoreOptions(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().resourceId(
          'com.android.chrome:id/menu_button',
        ),
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="Refresh"]',
        ),
      }),
    );
  }

  get switchTabsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="Switch or close tabs"]',
        ),
      }),
    );
  }

  get closeAllTabsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.LinearLayout[@resource-id="com.android.chrome:id/close_all_tabs_menu_id"]',
        ),
      }),
    );
  }

  get confirmCloseAllTabsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="com.android.chrome:id/positive_button"]',
        ),
      }),
    );
  }

  get newTabButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageView[@content-desc="New tab"]',
        ),
      }),
    );
  }

  get stopRefreshingButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="Stop refreshing"]',
        ),
      }),
    );
  }

  async goToAddress(address: string, pageObject: Dapp): Promise<void> {
    const currentActivity = await driver.getCurrentActivity();
    if (currentActivity !== Browsers.CHROME) {
      await driver.activateApp(Browsers.CHROME);
    }

    await driver.setOrientation('PORTRAIT');

    await this.urlAddressBar.waitForDisplayed({
      timeout: 10000,
    });

    const addressPrefix = address.substring(8, 16);
    if (!(await this.urlAddressBar.getText()).includes(addressPrefix)) {
      await this.urlAddressBar.click();
      await this.urlAddressBar.clearValue();
      await this.urlAddressBar.setValue(address);
      await driver.pressKeyCode(66);
    }

    if (pageObject) {
      // pageObject will be used to determine if the page was loaded successfully
      // once new test cases are added
      console.log('ChromeBrowserScreen.goToAddress:: PageObject is not null');
    }

    // await pageObject.terminate();
  }

  async tapSwitchTabsButton(): Promise<void> {
    await this.switchTabsButton.click();
  }

  async tapBrowserMoreOptionsButton(): Promise<void> {
    await this.browserMoreOptions.click();
  }

  async tapCloseAllTabsButton(): Promise<void> {
    await this.closeAllTabsButton.click();
  }

  async tapConfirmCloseAllTabsButton(): Promise<void> {
    await this.confirmCloseAllTabsButton.click();
  }

  async tapNewTabButton(): Promise<void> {
    await this.newTabButton.click();
  }

  async refreshPage(): Promise<void> {
    await this.browserMoreOptions.click();
    if (await this.stopRefreshingButton.isDisplayed()) {
      await this.stopRefreshingButton.click();
      await this.browserMoreOptions.click();
    }
    await this.refreshButton.click();
    await driver.pause(6000); // Wait for the page to refresh
  }

  async launchBrowser(): Promise<void> {
    // TODO
  }
}

const chromeBrowserScreen = new ChromeBrowserScreen();
export default chromeBrowserScreen;
