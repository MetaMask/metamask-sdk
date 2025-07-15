import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '@util/utils';
import { MobileBrowser } from '@screens/interfaces/MobileBrowser';
import { IOSSelector } from '@util/selectors';
import { Browsers } from '@util/constants';
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

    if (dappScreen) {
      // pageObject will be used to determine if the page was loaded successfully
      // once new test cases are added
      console.log('SafariBrowserScreen.goToAddress:: dappScreen is not null');
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
