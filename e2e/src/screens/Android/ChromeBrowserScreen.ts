import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { AndroidSelector } from '../../Selectors';
import { Dapp } from '../interfaces/Dapp';

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
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.ImageButton[@content-desc="More options"]',
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

  async goToAddress(address: string, pageObject: Dapp): Promise<void> {
    const urlAddressBar = this.urlAddressBar;

    await urlAddressBar.waitForDisplayed({
      timeout: 10000,
    });

    await urlAddressBar.click();
    await urlAddressBar.clearValue();
    await urlAddressBar.setValue(address);
    await driver.pressKeyCode(66);

    const connectButton =
      pageObject.connectButton as unknown as ChainablePromiseElement;

    // Tries to find the connect button 5 times for 10 seconds
    let retries = 0;
    if (!(await connectButton.isDisplayed()) && retries < 5) {
      await driver.pause(2000);
      retries += 1;
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
    await (this.refreshButton).click();
    await driver.pause(500); // Wait for the page to refresh

  }
}

const chromeBrowserScreen = new ChromeBrowserScreen();
export default chromeBrowserScreen;
