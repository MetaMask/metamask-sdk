import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class WelcomeComponent {
  get noThanksButton(): ChainablePromiseElement {
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
    await this.noThanksButton.waitForEnabled({
      timeout: 10000,
    });
    await this.noThanksButton.click();
    //* */XCUIElementTypeOther[`name == "Welcome to your wallet!"`]/XCUIElementTypeOther
  }
}

const welcomeComponent = new WelcomeComponent();
export default welcomeComponent;
