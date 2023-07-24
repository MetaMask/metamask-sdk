import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies
} from '../../../Strategies';
import Utils from '../../../Utils';

class WelcomeComponent {
  get noThanksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'onboarding-wizard-no-thanks-button',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: '**/XCUIElementTypeOther[`label == "No thanks"`]',
          strategy: IOSSelectorStrategies.IOSClassChain,
        },
      }),
    );
  }

  async tapNoThanksButton(): Promise<void> {
    while (await this.noThanksButton.isDisplayed()) {
      await (await this.noThanksButton).click();
    }
  }
}

export default new WelcomeComponent();
