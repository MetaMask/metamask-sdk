import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '../../Utils';
import { MobileBrowser } from '../interfaces/MobileBrowser';
import { IOSSelector } from '../../Selectors';
import { Dapp } from '../interfaces/Dapp';

class SafariBrowserScreen implements MobileBrowser {
  get urlAddressBar(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "Address"'),
      }),
    );
  }

  get goButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "go"'),
      }),
    );
  }

  get refreshButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "refresh"'),
      }),
    );
  }

  async refreshPage(): Promise<void> {
    await this.refreshButton.click();
    await driver.pause(500); // Wait for the page to refresh
  }

  async goToAddress(address: string, pageObject: Dapp): Promise<void> {
    // await driver.deleteAllCookies();
    await this.urlAddressBar.click();
    await this.urlAddressBar.clearValue();
    await this.urlAddressBar.setValue(address);
    await this.goButton.click();

    const connectButton =
      pageObject.connectButton as unknown as ChainablePromiseElement;

    // Tries to find the connect button 5 times for 10 seconds
    let retries = 0;
    if (!(await connectButton.isDisplayed()) && retries < 5) {
      await driver.pause(2000);
      retries += 1;
    }
  }
}

const safariBrowserScreen = new SafariBrowserScreen();
export default safariBrowserScreen;
