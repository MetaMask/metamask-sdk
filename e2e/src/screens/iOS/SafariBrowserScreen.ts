import { ChainablePromiseElement } from 'webdriverio';

import { IOSSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { driver } from '@wdio/globals';

class SafariBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "Address"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get goButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "go"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "refresh"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async refreshPage(): Promise<void> {
    await (await this.refreshButton).click();
    await driver.pause(500); // Wait for the page to refresh
  }

  async goToAddress(address: string): Promise<void> {
    // await driver.deleteAllCookies();
    await (await this.urlAddressBar).click();
    await (await this.urlAddressBar).clearValue();
    await (await this.urlAddressBar).setValue(address);
    await (await this.goButton).click();
  }
}

export default new SafariBrowserScreen();
