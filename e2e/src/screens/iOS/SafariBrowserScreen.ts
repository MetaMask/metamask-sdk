import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '@util/Utils';
import { MobileBrowser } from '@screens/interfaces/MobileBrowser';
import { IOSSelector } from '@util/Selectors';
import { Browsers } from '@util/Constants';
import { Dapp } from '@screens/interfaces/Dapp';

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

  get stopPageLoadingButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('name == "StopButton"'),
      }),
    );
  }

  async refreshPage(): Promise<void> {
    await this.refreshButton.click();
    await driver.pause(500); // Wait for the page to refresh
  }

  async goToAddress(address: string, dappScreen: Dapp): Promise<void> {
    await this.launchBrowser();

    // Trying to navigate directly to the address
    await driver.navigateTo(address);

    // waits for the refresh button to be displayed meaning that the page is loaded
    await this.refreshButton.waitForDisplayed({
      timeout: 10000,
    });

    await dappScreen.terminate();
  }

  async launchBrowser(): Promise<void> {
    const currentAppState = await driver.queryAppState(Browsers.SAFARI);
    // 4 is the state for the app being running in the foreground
    if (currentAppState !== 4) {
      await driver.activateApp(Browsers.SAFARI);
    }
  }
}

const safariBrowserScreen = new SafariBrowserScreen();
export default safariBrowserScreen;
