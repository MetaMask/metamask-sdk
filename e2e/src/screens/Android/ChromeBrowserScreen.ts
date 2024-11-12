import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { AndroidSelector } from '../../Selectors';
import { Dapp } from '../interfaces/Dapp';
import { Browsers, BrowsersActivity, WEB_DAPP_LOAD_ATTEMPTS } from '../../../src/Constants';
import { waitUntil } from 'webdriverio/build/commands/browser';

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
    if (currentActivity !== BrowsersActivity.CHROME) {
      await driver.activateApp(Browsers.CHROME);
    }

    await this.urlAddressBar.waitForDisplayed({
      timeout: 10000,
    });

    const addressPrefix = address.substring(8, 16);
    if (!(await this.urlAddressBar.getText()).includes(addressPrefix)) {
      await this.urlAddressBar.click();
      await this.urlAddressBar.clearValue();
      await this.urlAddressBar.setValue(address);
      await driver.pressKeyCode(66);
    } else {
      await this.refreshPage();
    }

    // Wait for the page to start loading
    await driver.pause(3000);

    const isWebDappLoaded = async () => {
      let retries = 20;
      // TODO: refactor this to use the page object
      let isConnectButtonDisplayed = await ((await pageObject.connectButton) as ChainablePromiseElement).isDisplayed();

      while (!isConnectButtonDisplayed && retries > 0) {
        // Waits for 2 seconds before checking again
        await driver.pause(2000);
        isConnectButtonDisplayed = await ((await pageObject.connectButton) as ChainablePromiseElement).isDisplayed();
        retries--;
      }
    };

    let attempts = 0;

    while (!isWebDappLoaded() && attempts < WEB_DAPP_LOAD_ATTEMPTS) {
      await this.refreshPage();
      attempts++;
    }
  }

  async tapSwitchTabsButton(): Promise<void> {
    await (this.switchTabsButton).click();
  }

  async tapBrowserMoreOptionsButton(): Promise<void> {
    await (this.browserMoreOptions).click();
  }

  async tapCloseAllTabsButton(): Promise<void> {
    await (this.closeAllTabsButton).click();
  }

  async tapConfirmCloseAllTabsButton(): Promise<void> {
    await (this.confirmCloseAllTabsButton).click();
  }

  async tapNewTabButton(): Promise<void> {
    await (this.newTabButton).click();
  }

  async refreshPage(): Promise<void> {
    await (this.browserMoreOptions).click();
    if (await this.stopRefreshingButton.isDisplayed()) {
      await this.stopRefreshingButton.click();
      await this.browserMoreOptions.click();
    }
    await this.refreshButton.click();
    await driver.pause(6000); // Wait for the page to refresh
  }
}

const chromeBrowserScreen = new ChromeBrowserScreen();
export default chromeBrowserScreen;
