import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';
import { visibilityOf } from 'wdio-wait-for';

class PersonalSignConfirmationComponent {
  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-confirm-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Confirm"'),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-cancel-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Reject"'),
      }),
    );
  }

  get messageText(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Personal Sign"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[starts-with(@label, "Message ")]',
        ),
      }),
    );
  }

  get personalSignContainerTitle(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.ViewGroup[@resource-id="personal-signature-request"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Signature request"',
        ),
      }),
    );
  }

  async isPersonalSignComponentDisplayed(): Promise<boolean> {
    const isPersonalSignComponentDisplayed = await driver.waitUntil(
      visibilityOf(this.personalSignContainerTitle),
      {
        timeout: 10000,
      },
    );
    return isPersonalSignComponentDisplayed;
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
