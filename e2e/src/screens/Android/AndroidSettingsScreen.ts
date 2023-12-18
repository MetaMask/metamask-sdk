import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector } from '../../Selectors';

class AndroidSettingsScreen {
  get metaMaskQALinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('MetaMask-QA'),
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
    await (await this.metaMaskQALinksButton).click();
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
