import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class NetworkSwitchedModalComponent {
  get gotItButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (
      await this.gotItButton
    ).waitForDisplayed({
      timeout: 10000,
    });
    await (await this.gotItButton).click();
  }
}

const networkSwitchedModalComponent = new NetworkSwitchedModalComponent();
export default networkSwitchedModalComponent;
