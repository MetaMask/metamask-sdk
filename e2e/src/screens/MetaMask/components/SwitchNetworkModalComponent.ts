import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class SwitchNetworkModalComponent {
  get switchNetworkButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get cancelButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (
      await this.switchNetworkButton
    ).waitForDisplayed({
      timeout: 5000,
    });

    await (
      await this.switchNetworkButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.switchNetworkButton).click();
  }

  async cancel(): Promise<void> {
    await (
      await this.cancelButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.cancelButton).click();
  }
}

const switchNetworkModalComponent = new SwitchNetworkModalComponent();
export default switchNetworkModalComponent;
