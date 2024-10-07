import { ChainablePromiseElement } from 'webdriverio';

import { IOSSelector } from '../../../Selectors';
import { getSelectorForPlatform } from '../../../Utils';

class IOSOpenInComponent {
  get open(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString(
          'name == "Open" AND label == "Open" AND value == "Open"',
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
