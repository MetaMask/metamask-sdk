import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class BottomNavigationComponent {
  get settingsButton(): ChainablePromiseElement {
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

  get walletButton(): ChainablePromiseElement {
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
    await this.settingsButton.click();
  }

  async tapHomeButton(): Promise<void> {
    await this.walletButton.click();
  }

  // Relying on the bottom navigation to be displayed to determine if the user is onboarded
  async isMetaMaskOnboarded(): Promise<boolean> {
    return (
      (await this.walletButton.isDisplayed()) &&
      (await this.settingsButton.isDisplayed())
    );
  }
}

const bottomNavigationComponent = new BottomNavigationComponent();
export default bottomNavigationComponent;
