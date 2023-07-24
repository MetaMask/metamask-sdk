import { ChainablePromiseElement } from 'webdriverio';
import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class SecurityUpdatesScreen {
  get noThanksSecurityUpdates(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'no-thanks-button',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: 'label == "No thanks"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapNoThanksSecurityUpdates(): Promise<void> {
    await (await this.noThanksSecurityUpdates).click();
  }
}

export default new SecurityUpdatesScreen();
