import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class WalletReadyScreen {
  get doneButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="onboarding-success-done-button"]',
        ),
        // TODO: Add iOS selector
        iosSelector: IOSSelector.by().predicateString('label == "No thanks"'),
      }),
    );
  }

  async tapDoneButton(): Promise<void> {
    await (
      await this.doneButton
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.doneButton).click();
  }
}

const walletReadyScreen = new WalletReadyScreen();
export default walletReadyScreen;
