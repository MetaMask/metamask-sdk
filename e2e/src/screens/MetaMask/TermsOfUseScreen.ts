import { ChainablePromiseElement } from 'webdriverio';
import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class TermsOfUseScreen {
  get acceptTermsOfUseCheckbox(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='terms-of-use-checkbox']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label BEGINSWITH "I agree to the Terms of Use"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get scrollToBottomButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            "//*[@resource-id='terms-of-use-scroll-end-arrow-button-id']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'name == "terms-of-use-scroll-end-arrow-button-id"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get acceptButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='terms-of-use-accept-button-id']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Accept"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
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
