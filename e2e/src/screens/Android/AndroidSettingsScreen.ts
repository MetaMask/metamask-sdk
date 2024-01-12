import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import {
  IS_RUNNING_IN_BROWSER_STACK,
  METAMASK_APP_NAME_ANDROID,
} from '../../Constants';
import { AndroidSelector } from '../../Selectors';

class AndroidSettingsScreen {
  get metaMaskQALinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(
          METAMASK_APP_NAME_ANDROID,
        ),
      }),
    );
  }

  get openSearchBarButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="com.android.settings:id/search_action_bar"]',
        ),
      }),
    );
  }

  get searchBarInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="com.google.android.settings.intelligence:id/open_search_view_edit_text"]',
        ),
      }),
    );
  }

  get openingLinksSearchResult(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          IS_RUNNING_IN_BROWSER_STACK
            ? '(//android.widget.TextView[@resource-id="android:id/title"])[2]'
            : '//*[@resource-id="android:id/title" and @text="Opening links"]',
        ),
      }),
    );
  }

  get supportedWebAddresses(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(
          'Supported web addresses',
        ),
      }),
    );
  }

  get links(): ReturnType<WebdriverIO.Browser['$$']> {
    return $$(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath('//android.widget.Switch'),
      }),
    );
  }

  async tapMetaMaskLinksButton(): Promise<void> {
    await (
      await this.metaMaskQALinksButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.metaMaskQALinksButton).click();
  }

  async tapOpenSearchBarButton(): Promise<void> {
    await (
      await this.openSearchBarButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.openSearchBarButton).click();
  }

  async tapOpeningLinksSearchResult(): Promise<void> {
    await (
      await this.openingLinksSearchResult
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.openingLinksSearchResult).click();
  }

  async fillSearchBarInput(text: string): Promise<void> {
    await (await this.searchBarInput).setValue(text);
  }

  async tapSupportedWebAddresses(): Promise<void> {
    await (
      await this.supportedWebAddresses
    ).waitForEnabled({
      timeout: 5000,
    });
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
