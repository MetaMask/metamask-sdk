import { ChainablePromiseElement } from 'webdriverio';
import { METAMASK_APP_NAME_ANDROID } from '../../Constants';
import Gestures from '../../Gestures';
import { AndroidSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';

class AndroidSettingsOpeningLinksScreen {
  get openingLinksMetaMaskAppOption(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: `//android.widget.TextView[@resource-id="android:id/title" and @text="${METAMASK_APP_NAME_ANDROID}"]`,
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get addLinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="android:id/title" and @text="Add link"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get addSupportedLinksButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.Button[@resource-id="android:id/button1"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get firstSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="android:id/text1" and @text="metamask-alternate.app.link"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get secondSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="android:id/text1" and @text="metamask-alternate.test-app.link"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get thirdSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="android:id/text1" and @text="metamask.test-app.link"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get forthSupportedLink(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="android:id/text1" and @text="metamask.app.link"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
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

  async isAddLinksButtonDisabled(): Promise<boolean> {
    return (await (await this.addLinksButton).isClickable()) === false;
  }
}

const androidSettingsOpeningLinksScreen =
  new AndroidSettingsOpeningLinksScreen();

export default androidSettingsOpeningLinksScreen;
