import { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

import { $$ } from '@wdio/globals';
import Gestures from '@util/Gestures';
import { getSelectorForPlatform } from '@util/Utils';
import {
  IS_RUNNING_IN_BROWSER_STACK,
  METAMASK_APP_NAME_ANDROID,
} from '@util/Constants';
import { AndroidSelector } from '@util/Selectors';

class AndroidSettingsScreen {
  get metaMaskQALinksButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(
          METAMASK_APP_NAME_ANDROID,
        ),
      }),
    );
  }

  get openSearchBarButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="com.android.settings:id/search_action_bar"]',
        ),
      }),
    );
  }

  get searchBarInput(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="com.google.android.settings.intelligence:id/open_search_view_edit_text"]',
        ),
      }),
    );
  }

  get openingLinksSearchResult(): ChainablePromiseElement {
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

  get supportedWebAddresses(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(
          'Supported web addresses',
        ),
      }),
    );
  }

  get links(): ChainablePromiseArray {
    return $$(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath('//android.widget.Switch'),
      }),
    );
  }

  async tapMetaMaskLinksButton(): Promise<void> {
    await this.metaMaskQALinksButton.waitForEnabled({
      timeout: 5000,
    });
    await this.metaMaskQALinksButton.click();
  }

  async tapOpenSearchBarButton(): Promise<void> {
    await this.openSearchBarButton.waitForEnabled({
      timeout: 5000,
    });
    await this.openSearchBarButton.click();
  }

  async tapOpeningLinksSearchResult(): Promise<void> {
    await this.openingLinksSearchResult.waitForEnabled({
      timeout: 5000,
    });
    await this.openingLinksSearchResult.click();
  }

  async fillSearchBarInput(text: string): Promise<void> {
    await this.searchBarInput.setValue(text);
  }

  async tapSupportedWebAddresses(): Promise<void> {
    await this.supportedWebAddresses.waitForEnabled({
      timeout: 5000,
    });
    await this.supportedWebAddresses.click();
  }

  async tapLinks(): Promise<void> {
    // @ts-ignore
    // ts-ignore because this is not in use for the time being
    for (const link of this.links) {
      await link.click();
    }
  }

  async setSupportedAddresses(): Promise<void> {
    let isMetaMaskLinksButtonDisplayed =
      await this.metaMaskQALinksButton.isDisplayed();
    while (!isMetaMaskLinksButtonDisplayed) {
      await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      isMetaMaskLinksButtonDisplayed =
        await this.metaMaskQALinksButton.isDisplayed();
    }
    await this.tapMetaMaskLinksButton();
    await this.tapSupportedWebAddresses();
    await this.tapLinks();
  }
}

const androidSettingsScreen = new AndroidSettingsScreen();
export default androidSettingsScreen;
