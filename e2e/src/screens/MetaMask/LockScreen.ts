import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class LockScreen {
  get passwordInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="login-password-input"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'name == "login-password-input"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get loginTitle(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="login-title"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Welcome Back!"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get unlockButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="log-in-button"]/android.widget.Button',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "UNLOCK" AND name == "UNLOCK"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async isMMLocked(): Promise<boolean> {
    return (await this.loginTitle).isDisplayed();
  }

  async unlockMM(password: string): Promise<void> {
    await (await this.passwordInput).setValue(password);
    await (await this.unlockButton).click();
  }

  async unlockMMifLocked(password: string): Promise<void> {
    if (await this.isMMLocked()) {
      await this.unlockMM(password);
    }
  }
}

export default new LockScreen();
