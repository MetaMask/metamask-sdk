import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { visibilityOf } from 'wdio-wait-for';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';
import MainScreen from './MainScreen';

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

  async unlockMM(password: string): Promise<boolean> {
    /*
    const maxAttempts = 10;
    let attempts = 0;
    while (attempts < maxAttempts) {
      if (await (await this.passwordInput).isDisplayed()) {
        await (await this.passwordInput).setValue(password);
        await (await this.unlockButton).click();
      }
      console.log('AAA: Bumping attenps to: ', attempts);
      attempts += 1;
      console.log('AAA: Waiting for 2 seconds');
      await driver.pause(2000);
    }

    return await (await MainScreen.networkSwitcher).isDisplayed();
     */
    await driver
      .waitUntil(visibilityOf(this.passwordInput), {
        timeout: 60000,
        interval: 5000,
        timeoutMsg: 'Password input not visible',
      })
      .then(async () => {
        await (await this.passwordInput).setValue(password);
        await (await this.unlockButton).click();
      })
      .catch((e) => {
        console.error('Error unlocking MM: ', e);
      });
    return await (await MainScreen.networkSwitcher).isDisplayed();
  }

  async unlockMMifLocked(password: string): Promise<void> {
    if (await this.isMMLocked()) {
      await this.unlockMM(password);
    }
  }
}

const lockScreen = new LockScreen();
export default lockScreen;
