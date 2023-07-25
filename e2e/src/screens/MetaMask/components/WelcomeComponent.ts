import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../../Strategies';
import Utils from '../../../Utils';

class WelcomeComponent {
  get noThanksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='onboarding-wizard-no-thanks-button']",
          strategy: AndroidSelectorStrategies.Xpath,
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

const welcomeComponent = new WelcomeComponent();
export default welcomeComponent;
