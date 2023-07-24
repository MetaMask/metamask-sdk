import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies
} from '../../../Strategies';
import Utils from '../../../Utils';

class WhatsNewComponent {
  get closeModalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'whats-new-modal-close-button',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: 'name == "whats-new-modal-close-button"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async closeModal(): Promise<void> {
    try {
      await (await this.closeModalButton).click();
    } catch (e) {
      console.log('No Whats New Modal to close, skipping: ', e.message);
    }
  }
}

export default new WhatsNewComponent();
