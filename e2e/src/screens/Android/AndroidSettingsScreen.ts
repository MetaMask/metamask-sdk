import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { AndroidSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';

class AndroidSettingsScreen {
  get metaMaskQALinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("MetaMask-QA")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
      }),
    );
  }

  get openSearchBarButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="com.android.settings:id/search_action_bar"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get searchBarInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="com.google.android.settings.intelligence:id/open_search_view_edit_text"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get openingLinksSearchResult(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="android:id/title" and @text="Opening links"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get supportedWebAddresses(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("Supported web addresses")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
      }),
    );
  }

  get links(): ReturnType<WebdriverIO.Browser['$$']> {
    return $$(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.Switch',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  async tapMetaMaskLinksButton(): Promise<void> {
    await (await this.metaMaskQALinksButton).click();
  }

  async tapOpenSearchBarButton(): Promise<void> {
    await (await this.openSearchBarButton).click();
  }

  async tapOpeningLinksSearchResult(): Promise<void> {
    await (await this.openingLinksSearchResult).click();
  }

  async fillSearchBarInput(text: string): Promise<void> {
    await (await this.searchBarInput).setValue(text);
  }

  async tapSupportedWebAddresses(): Promise<void> {
    await (await this.supportedWebAddresses).click();
  }

  async tapLinks(): Promise<void> {
    for (const link of await this.links) {
      await link.click();
    }
  }

  async setSupportedAddresses(): Promise<void> {
    let isMetaMaskLinksButtonDisplayed = await (
      await this.metaMaskQALinksButton
    ).isDisplayed();
    while (!isMetaMaskLinksButtonDisplayed) {
      await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      isMetaMaskLinksButtonDisplayed = await (
        await this.metaMaskQALinksButton
      ).isDisplayed();
    }
    await this.tapMetaMaskLinksButton();
    await this.tapSupportedWebAddresses();
    await this.tapLinks();
  }
}

const androidSettingsScreen = new AndroidSettingsScreen();
export default androidSettingsScreen;
