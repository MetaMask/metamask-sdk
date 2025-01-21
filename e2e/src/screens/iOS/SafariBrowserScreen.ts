import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '@/util/Utils';
import { MobileBrowser } from '@/screens/interfaces/MobileBrowser';
import { IOSSelector } from '@/util/Selectors';
import { Browsers, WEB_DAPP_LOAD_ATTEMPTS } from '@/util/Constants';

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

  async goToAddress(address: string): Promise<void> {
    await this.launchBrowser();

    const addressPrefix = address.substring(8, 16);
    if (!(await this.urlAddressBar.getText()).includes(addressPrefix)) {
      await this.urlAddressBar.click();
      await this.urlAddressBar.clearValue();
      await this.urlAddressBar.setValue(address);
      await this.goButton.click();
    }

    // Figures out if a dapp is loaded on the mobile browser
    const checkIfDappIsLoaded = async () => {
      let retries = 20;
      let isStopPageLoadButtonDisplayed =
        await this.stopPageLoadingButton.isDisplayed();

      if (!isStopPageLoadButtonDisplayed) {
        return true;
      }

      while (isStopPageLoadButtonDisplayed && retries > 0) {
        // Waits for 2 seconds before checking again
        await driver.pause(2000);
        isStopPageLoadButtonDisplayed =
          await this.stopPageLoadingButton.isDisplayed();
        retries -= 1;
      }
      return false;
    };

    let attempts = 0;

    let isWebDappLoaded = await checkIfDappIsLoaded();

    while (!isWebDappLoaded && attempts < WEB_DAPP_LOAD_ATTEMPTS) {
      await this.refreshPage();
      isWebDappLoaded = await checkIfDappIsLoaded();
      attempts += 1;
    }
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
