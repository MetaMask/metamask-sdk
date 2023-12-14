import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../../Strategies';
import Utils from '../../../Utils';

class SignModalComponent {
  get signApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//android.widget.Button[@content-desc="request-signature-confirm-button"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Sign"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//android.widget.Button[@content-desc="request-signature-cancel-button"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Cancel"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapSignApproval(): Promise<void> {
    await (await this.signApprovalButton).click();
  }

  async tapCancel(): Promise<void> {
    await (await this.cancelButton).click();
  }
}

const signModalComponent = new SignModalComponent();
export default signModalComponent;
