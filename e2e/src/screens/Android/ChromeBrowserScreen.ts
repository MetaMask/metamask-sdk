import { ChainablePromiseElement, Key } from 'webdriverio';
import { driver } from '@wdio/globals';
import Gestures from '../../Gestures';
import { AndroidSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';

class ChromeBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().className("android.widget.EditText")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
      }),
    );
  }

  // 3 dots on the top
  get browserMoreOptions(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.ImageButton[@content-desc="More options"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.ImageButton[@content-desc="Refresh"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  async goToAddress(address: string): Promise<void> {
    const urlAddressBar = await this.urlAddressBar;
    await urlAddressBar.click();
    await urlAddressBar.clearValue();
    await urlAddressBar.setValue(address);
    await Gestures.tapDeviceKey(Key.Enter);
    await driver.pressKeyCode(66);
  }

  async refreshPage(): Promise<void> {
    await (await this.browserMoreOptions).click();
    await (await this.refreshButton).click();
    await driver.pause(500); // Wait for the page to refresh
  }
}

const chromeBrowserScreen = new ChromeBrowserScreen();
export default chromeBrowserScreen;
