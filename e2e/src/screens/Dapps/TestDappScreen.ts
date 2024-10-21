import { ChainablePromiseElement } from 'webdriverio';

import { driver } from '@wdio/globals';
import { Dapp } from '../interfaces/Dapp';
import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class TestDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="connectButton"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "CONNECT"'),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="personalSign"]',
        ),
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeButton[`name == "SIGN"`][2]',
        ),
      }),
    );
  }

  get signTypedDataV3Button(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="signTypedDataV3"]',
        ),
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeButton[`name == "SIGN"`][4]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@resource-id="terminateButton"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "DISCONNECT"'),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async signTypedDataV3(): Promise<void> {
    await this.scrollToSignTypedDataV3Button();
    await this.signTypedDataV3Button.click();
  }

  async personalSign(): Promise<void> {
    await this.scrollToPersonalSignButton();
    await this.personalSignButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async scrollToSignTypedDataV3Button(): Promise<void> {
    let isButtonDisplayed = await this.signTypedDataV3Button.isDisplayed();

    while (!isButtonDisplayed) {
      if (driver.isAndroid) {
        await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      } else {
        await Gestures.swipeByPercentage({ x: 50, y: 50 }, { x: 50, y: 5 });
      }

      isButtonDisplayed = await this.signTypedDataV3Button.isDisplayed();
    }
  }

  async scrollToPersonalSignButton(): Promise<void> {
    let isButtonDisplayed = await this.personalSignButton.isDisplayed();

    while (!isButtonDisplayed) {
      if (driver.isAndroid) {
        await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      } else {
        await Gestures.swipeByPercentage({ x: 50, y: 50 }, { x: 50, y: 5 });
      }

      isButtonDisplayed = await this.personalSignButton.isDisplayed();
    }
  }
}

const testDappScreen = new TestDappScreen();
export default testDappScreen;
