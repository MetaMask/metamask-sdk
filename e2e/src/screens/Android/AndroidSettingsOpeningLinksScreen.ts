import { ChainablePromiseElement } from 'webdriverio';
import { METAMASK_APP_NAME_ANDROID } from '../../Constants';
import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector } from '../../Selectors';

class AndroidSettingsOpeningLinksScreen {
  get openingLinksMetaMaskAppOption(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          `//android.widget.TextView[@resource-id="android:id/title" and @text="${METAMASK_APP_NAME_ANDROID}"]`,
        ),
      }),
    );
  }

  get addLinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="android:id/title" and @text="Add link"]',
        ),
      }),
    );
  }

  get addSupportedLinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="android:id/button1"]',
        ),
      }),
    );
  }

  get firstSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="android:id/text1" and @text="metamask-alternate.app.link"]',
        ),
      }),
    );
  }

  get secondSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="android:id/text1" and @text="metamask-alternate.test-app.link"]',
        ),
      }),
    );
  }

  get thirdSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="android:id/text1" and @text="metamask.test-app.link"]',
        ),
      }),
    );
  }

  get forthSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="android:id/text1" and @text="metamask.app.link"]',
        ),
      }),
    );
  }

  async scrollToMetaMaskAppOption(): Promise<void> {
    let isMetaMaskLinksButtonDisplayed = await (
      await this.openingLinksMetaMaskAppOption
    ).isDisplayed();

    while (!isMetaMaskLinksButtonDisplayed) {
      await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      isMetaMaskLinksButtonDisplayed = await (
        await this.openingLinksMetaMaskAppOption
      ).isDisplayed();
    }
  }

  async tapMetaMaskAppOption(): Promise<void> {
    await (await this.openingLinksMetaMaskAppOption).click();
  }

  async selectAllMetaMaskSupportedLinks(): Promise<void> {
    await (await this.firstSupportedLink).click();
    await (await this.secondSupportedLink).click();
    await (await this.thirdSupportedLink).click();
    await (await this.forthSupportedLink).click();
  }

  async tapAddMetaMaskSupportedLinks(): Promise<void> {
    await (await this.addSupportedLinksButton).click();
  }

  async tapAddLinksButton(): Promise<void> {
    await (await this.addLinksButton).click();
  }

  async isAddLinksButtonEnabled(): Promise<boolean> {
    return await (await this.addLinksButton).isEnabled();
  }
}

const androidSettingsOpeningLinksScreen =
  new AndroidSettingsOpeningLinksScreen();

export default androidSettingsOpeningLinksScreen;
