import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class SecurityUpdatesScreen {
  get noThanksSecurityUpdates(): ChainablePromiseElement {
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
    await this.noThanksSecurityUpdates.waitForEnabled({
      timeout: 10000,
    });
    await this.noThanksSecurityUpdates.click();
  }
}

const securityUpdatesScreen = new SecurityUpdatesScreen();
export default securityUpdatesScreen;
