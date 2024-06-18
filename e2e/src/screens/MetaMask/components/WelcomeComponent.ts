import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class WelcomeComponent {
  get noThanksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          "//*[@resource-id='onboarding-wizard-no-thanks-button']",
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "onboarding-wizard-no-thanks-button"',
        ),
      }),
    );
  }

  async tapNoThanksButton(): Promise<void> {
    await (
      await this.noThanksButton
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.noThanksButton).click();
    //* */XCUIElementTypeOther[`name == "Welcome to your wallet!"`]/XCUIElementTypeOther
  }
}

const welcomeComponent = new WelcomeComponent();
export default welcomeComponent;
