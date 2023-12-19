import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class TermsOfUseScreen {
  get acceptTermsOfUseCheckbox(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get scrollToBottomButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get acceptButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (await this.scrollToBottomButton).click();
  }

  async tapAcceptTermsOfUseCheckbox(): Promise<void> {
    await (await this.acceptTermsOfUseCheckbox).click();
  }

  async isAcceptButtonEnabled(): Promise<boolean> {
    return await (await this.acceptButton).isEnabled();
  }

  async tapAcceptTermsOfUseButton(): Promise<void> {
    await (await this.acceptButton).click();
  }
}

const termsOfUseScreen = new TermsOfUseScreen();
export default termsOfUseScreen;
