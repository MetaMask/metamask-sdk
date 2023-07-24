import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class GetStartedScreen {
  get getStartedButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'welcome-screen-get-started-button-id',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: 'label == "Get started"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapGetStarted(): Promise<void> {
    await (await this.getStartedButton).click();
  }
}

export default new GetStartedScreen();
