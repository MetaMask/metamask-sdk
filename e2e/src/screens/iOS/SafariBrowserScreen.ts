import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { IOSSelector } from '../../Selectors';
import { Dapp } from '../interfaces/Dapp';

class SafariBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "Address"'),
      }),
    );
  }

  get goButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "go"'),
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "refresh"'),
      }),
    );
  }

  async refreshPage(): Promise<void> {
    await (await this.refreshButton).click();
    await driver.pause(500); // Wait for the page to refresh
  }

  async goToAddress(address: string, pageObject: Dapp): Promise<void> {
    // await driver.deleteAllCookies();
    await (await this.urlAddressBar).click();
    await (await this.urlAddressBar).clearValue();
    await (await this.urlAddressBar).setValue(address);
    await (await this.goButton).click();

    const connectButton =
      pageObject.connectButton as unknown as ChainablePromiseElement<Element>;

    while (!(await connectButton.isDisplayed())) {
      await driver.pause(1000);
    }
  }
}

const safariBrowserScreen = new SafariBrowserScreen();
export default safariBrowserScreen;
