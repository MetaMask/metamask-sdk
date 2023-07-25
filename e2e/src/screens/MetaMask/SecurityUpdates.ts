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
          locator: "//*[@resource-id='no-thanks-button']",
          strategy: AndroidSelectorStrategies.Xpath,
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

const securityUpdatesScreen = new SecurityUpdatesScreen();
export default securityUpdatesScreen;
