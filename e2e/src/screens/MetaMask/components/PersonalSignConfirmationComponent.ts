import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector, IOSSelector } from '@util/selectors';
import { visibilityOf } from 'wdio-wait-for';

class PersonalSignConfirmationComponent {
  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="Confirm"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "confirm-button"',
        ),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="Reject"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "cancel-button"',
        ),
      }),
    );
  }

  // TODO: adapt this to get any type of message based on the dapp
  get messageText(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Hello, world!"]',
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
          '//android.view.ViewGroup[@resource-id="personal_sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "personal_sign"',
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
