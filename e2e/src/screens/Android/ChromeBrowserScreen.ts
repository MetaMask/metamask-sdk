import { ChainablePromiseElement, Key } from 'webdriverio';
import Gestures from '../../Gestures';
import { AndroidSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';

class ChromeBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="com.android.chrome:id/url_bar"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  async goToAddress(address: string): Promise<void> {
    await (await this.urlAddressBar).click();
    await (await this.urlAddressBar).clearValue();
    await (await this.urlAddressBar).setValue(address);
    await Gestures.tapDeviceKey(Key.Enter);
    await driver.pressKeyCode(66);
  }

  refreshPage(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export default new ChromeBrowserScreen();
