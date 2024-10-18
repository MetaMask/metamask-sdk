import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class ConnectModalComponent {
  get accountApprovalModalContainer(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="account-approval-modal-container"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "account-approval-modal-container"',
        ),
      }),
    );
  }

  get connectApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="connect-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get cancelApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="cancel-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Cancel"'),
      }),
    );
  }

  async tapConnectApproval(): Promise<void> {
    await (
      await this.connectApprovalButton
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.connectApprovalButton).click();
  }
}

const connectModalComponent = new ConnectModalComponent();
export default connectModalComponent;
