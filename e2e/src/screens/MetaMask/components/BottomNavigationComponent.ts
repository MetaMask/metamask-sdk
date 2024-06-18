import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class BottomNavigationComponent {
  get settingsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="tab-bar-item-Setting"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "tab-bar-item-Setting"',
        ),
      }),
    );
  }

  get walletButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="tab-bar-item-Wallet"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "tab-bar-item-Wallet"',
        ),
      }),
    );
  }

  async tapSettingsButton(): Promise<void> {
    await (await this.settingsButton).click();
  }

  async tapHomeButton(): Promise<void> {
    await (await this.walletButton).click();
  }

  // Relying on the bottom navigation to be displayed to determine if the user is onboarded
  async isMetaMaskOnboarded(): Promise<boolean> {
    return (
      (await (await this.walletButton).isDisplayed()) &&
      (await (await this.settingsButton).isDisplayed())
    );
  }
}

const bottomNavigationComponent = new BottomNavigationComponent();
export default bottomNavigationComponent;
