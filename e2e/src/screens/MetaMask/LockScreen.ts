import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class LockScreen {
  get passwordInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="login-password-input"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "login-password-input"',
        ),
      }),
    );
  }

  get loginTitle(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="login-title"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "Welcome Back!"',
        ),
      }),
    );
  }

  get unlockButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="log-in-button"]/android.widget.Button',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "UNLOCK" AND name == "UNLOCK"',
        ),
      }),
    );
  }

  async isMMLocked(): Promise<boolean> {
    return (await this.loginTitle).isDisplayed();
  }

  async unlockMM(password: string): Promise<void> {
    await (await this.passwordInput).setValue(password);
    await driver.pause(2000);
    await (await this.unlockButton).click();
  }

  async unlockMMifLocked(password: string): Promise<void> {
    if (await this.isMMLocked()) {
      await this.unlockMM(password);
    }
  }
}

const lockScreen = new LockScreen();
export default lockScreen;
