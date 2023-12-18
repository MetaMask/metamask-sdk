import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class SecurityUpdatesScreen {
  get noThanksSecurityUpdates(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="no-thanks-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "No thanks"'),
      }),
    );
  }

  async tapNoThanksSecurityUpdates(): Promise<void> {
    await (await this.noThanksSecurityUpdates).click();
  }
}

const securityUpdatesScreen = new SecurityUpdatesScreen();
export default securityUpdatesScreen;
