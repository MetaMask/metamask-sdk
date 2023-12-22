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
          '//android.widget.Button[@content-desc="connect-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get cancelApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="cancel-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Cancel"'),
      }),
    );
  }

  async tapConnectApproval(): Promise<void> {
    await (await this.connectApprovalButton).click();
  }
}

const connectModalComponent = new ConnectModalComponent();
export default connectModalComponent;
