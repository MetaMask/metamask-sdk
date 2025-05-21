import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class TermsOfUseScreen {
  get acceptTermsOfUseCheckbox(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="terms-of-use-checkbox"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label BEGINSWITH "I agree to the Terms of Use"',
        ),
      }),
    );
  }

  get scrollToBottomButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="terms-of-use-scroll-end-arrow-button-id"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "terms-of-use-scroll-end-arrow-button-id"',
        ),
      }),
    );
  }

  get acceptButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="terms-of-use-accept-button-id"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Accept"'),
      }),
    );
  }

  async tapScrollToBottom(): Promise<void> {
    await this.scrollToBottomButton.click();
  }

  async tapAcceptTermsOfUseCheckbox(): Promise<void> {
    await this.acceptTermsOfUseCheckbox.click();
  }

  async isAcceptButtonEnabled(): Promise<boolean> {
    return await this.acceptButton.isEnabled();
  }

  async tapAcceptTermsOfUseButton(): Promise<void> {
    await this.acceptButton.click();
  }
}

const termsOfUseScreen = new TermsOfUseScreen();
export default termsOfUseScreen;
