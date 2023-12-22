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
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeOther[`label == "No thanks"`]',
        ),
      }),
    );
  }

  async tapNoThanksButton(): Promise<void> {
    await (await this.noThanksButton).click();
  }
}

const welcomeComponent = new WelcomeComponent();
export default welcomeComponent;
