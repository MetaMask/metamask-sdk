import { ChainablePromiseElement } from 'webdriverio';

import { IOSSelector } from '@/util/Selectors';
import { getSelectorForPlatform } from '@/util/Utils';

class IOSOpenInComponent {
  get open(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().xpath(
          '//XCUIElementTypeStaticText[@name="Open"]',
        ),
      }),
    );
  }

  get cancel(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString(
          'name == "Cancel" AND label == "Cancel" AND value == "Cancel"',
        ),
      }),
    );
  }

  async tapOpen(): Promise<void> {
    await this.open.click();
  }

  async tapCancel(): Promise<void> {
    await this.cancel.click();
  }
}

const iOSOpenInComponent = new IOSOpenInComponent();
export default iOSOpenInComponent;
