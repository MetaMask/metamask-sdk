import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class SwitchNetworkModalComponent {
  get switchNetworkButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Switch Network"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "connect-button"',
        ),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Cancel"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "cancel-button"',
        ),
      }),
    );
  }

  async switchNetwork(): Promise<void> {
    await this.switchNetworkButton.waitForDisplayed({
      timeout: 5000,
    });

    await this.switchNetworkButton.waitForEnabled({
      timeout: 5000,
    });
    await this.switchNetworkButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.waitForEnabled({
      timeout: 5000,
    });
    await this.cancelButton.click();
  }
}

const switchNetworkModalComponent = new SwitchNetworkModalComponent();
export default switchNetworkModalComponent;
