import { ChainablePromiseElement } from 'webdriverio';

import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../../Strategies';
import Utils from '../../../Utils';

class BottomNavigationComponent {
  get settingsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='tab-bar-item-Setting']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'name == "tab-bar-item-Setting"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get walletButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: "//*[@resource-id='tab-bar-item-Wallet']",
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'name == "tab-bar-item-Wallet"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
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
