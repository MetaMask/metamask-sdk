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
    await (await this.noThanksButton).click();
    // Wait for the button to disappear
    await (
      await this.noThanksButton
    ).waitForDisplayed({
      timeout: 1000,
      reverse: true,
    });
  }
}

const welcomeComponent = new WelcomeComponent();
export default welcomeComponent;
