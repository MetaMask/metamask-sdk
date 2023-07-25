import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../../Strategies';
import Utils from '../../../Utils';

// TODO
class ConnectModalComponent {
  get accountApprovalModalContainer(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='account-approval-modal-container']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'name == "account-approval-modal-container"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get connectApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            'new UiSelector().description("connect-approve-button")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "Connect"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get cancelApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().description("connect-cancel-button")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "Cancel"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapConnectApproval(): Promise<void> {
    await (await this.connectApprovalButton).click();
  }
}

const connectModalComponent = new ConnectModalComponent();
export default connectModalComponent;
