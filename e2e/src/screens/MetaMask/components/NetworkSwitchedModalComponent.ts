import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector, IOSSelector } from '@util/selectors';

class NetworkSwitchedModalComponent {
  get gotItButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="network-education-modal-close-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "network-education-modal-close-button"',
        ),
      }),
    );
  }

  async tapGotItButton(): Promise<void> {
    await this.gotItButton.waitForDisplayed({
      timeout: 10000,
    });
    await this.gotItButton.click();
  }
}

const networkSwitchedModalComponent = new NetworkSwitchedModalComponent();
export default networkSwitchedModalComponent;
