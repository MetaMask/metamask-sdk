import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class PersonalSignConfirmationComponent {
  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-confirm-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "tab-bar-item-Setting"',
        ),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-cancel-button"]',
        ),
      }),
    );
  }

  // TODO: add iOS locator
  get messageText(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Personal Sign"]',
        ),
      }),
    );
  }

  // TODO: add iOS locator
  get personalSignContainer(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.ViewGroup[@resource-id="personal-signature-request"]',
        ),
      }),
    );
  }

  async tapSignButton(): Promise<void> {
    await this.signButton.click();
  }

  async tapCancelButton(): Promise<void> {
    await this.cancelButton.click();
  }
}

const personalSignConfirmationComponent =
  new PersonalSignConfirmationComponent();
export default personalSignConfirmationComponent;
