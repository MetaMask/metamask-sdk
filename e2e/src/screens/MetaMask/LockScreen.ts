import { ChainablePromiseElement } from 'webdriverio';
import { driver } from '@wdio/globals';
import { visibilityOf } from 'wdio-wait-for';
import MainScreen from './MainScreen';
import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class LockScreen {
  get passwordInput(): ChainablePromiseElement {
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

  get loginTitle(): ChainablePromiseElement {
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

  get unlockButton(): ChainablePromiseElement {
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

  async isMMOnboarded(): Promise<boolean> {
    const isWelcomeBackVisible = await driver
      .waitUntil(visibilityOf(this.loginTitle), {
        timeout: 10000,
        interval: 5000,
        timeoutMsg:
          'Welcome Back! is not visible. Assuming Wallet is not onboarded',
      })
      .catch((e) => {
        console.error('Error unlocking MM: ', e);
      });
    return Boolean(isWelcomeBackVisible);
  }

  async isMMLocked(): Promise<boolean> {
    await driver
      .waitUntil(visibilityOf(MainScreen.networkSwitcher), {
        timeout: 60000,
        interval: 5000,
        timeoutMsg: 'Network switcher not visible. Wallet is not unlocked,',
      })
      .then(() => {
        return true;
      })
      .catch((e) => {
        console.error('Error unlocking MM: ', e);
      });
    return false;
  }

  async unlockMM(password: string): Promise<void> {
    await driver
      .waitUntil(visibilityOf(this.passwordInput), {
        timeout: 60000,
        interval: 5000,
        timeoutMsg: 'Password input not visible',
      })
      .then(async () => {
        // await driver.pause(5000);
        await this.passwordInput.setValue(password);
        await this.unlockButton.click();
        // Wait for the wallet to be unlocked
        await driver.pause(3500);
      })
      .catch((e) => {
        console.error('Error unlocking MM: ', e);
      });
  }

  async unlockMMifLocked(password: string): Promise<void> {
    if (await this.isMMLocked()) {
      await this.unlockMM(password);
    }
  }
}

const lockScreen = new LockScreen();
export default lockScreen;
