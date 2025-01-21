import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class WalletReadyScreen {
  get doneButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="onboarding-success-done-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "onboarding-success-done-button"',
        ),
      }),
    );
  }

  async tapDoneButton(): Promise<void> {
    await this.doneButton.waitForEnabled({
      timeout: 10000,
    });
    await this.doneButton.click();
  }
}

const walletReadyScreen = new WalletReadyScreen();
export default walletReadyScreen;
