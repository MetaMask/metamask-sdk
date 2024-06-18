import { ChainablePromiseElement, Key } from 'webdriverio';
import { driver } from '@wdio/globals';
import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { AndroidSelector } from '../../Selectors';

class ChromeBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndClassName(
          'android.widget.EditText',
        ),
      }),
    );
  }

  // 3 dots on the top
  get browserMoreOptions(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="More options"]',
        ),
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="Refresh"]',
        ),
      }),
    );
  }

  get switchTabsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="Switch or close tabs"]',
        ),
      }),
    );
  }

  get closeAllTabsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.LinearLayout[@resource-id="com.android.chrome:id/close_all_tabs_menu_id"]',
        ),
      }),
    );
  }

  get confirmCloseAllTabsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="com.android.chrome:id/positive_button"]',
        ),
      }),
    );
  }

  get newTabButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageView[@content-desc="New tab"]',
        ),
      }),
    );
  }

  async goToAddress(address: string): Promise<void> {
    const urlAddressBar = await this.urlAddressBar;

    await urlAddressBar.waitForDisplayed({
      timeout: 10000,
    });

    await urlAddressBar.click();
    await urlAddressBar.clearValue();
    await urlAddressBar.setValue(address);
    await Gestures.tapDeviceKey(Key.Enter);
    await driver.pressKeyCode(66);
  }

  async tapSwitchTabsButton(): Promise<void> {
    await (await this.switchTabsButton).click();
  }

  async tapBrowserMoreOptionsButton(): Promise<void> {
    await (await this.browserMoreOptions).click();
  }

  async tapCloseAllTabsButton(): Promise<void> {
    await (await this.closeAllTabsButton).click();
  }

  async tapConfirmCloseAllTabsButton(): Promise<void> {
    await (await this.confirmCloseAllTabsButton).click();
  }

  async tapNewTabButton(): Promise<void> {
    await (await this.newTabButton).click();
  }

  async refreshPage(): Promise<void> {
    await (await this.browserMoreOptions).click();
    await (await this.refreshButton).click();
    await driver.pause(500); // Wait for the page to refresh
  }
}

const chromeBrowserScreen = new ChromeBrowserScreen();
export default chromeBrowserScreen;
