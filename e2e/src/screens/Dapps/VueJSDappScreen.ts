import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@/util/Utils';
import { Dapp } from '@/screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class VueJSDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeStaticText[`name == "Connect wallet"`]',
        ),
      }),
    );
  }

  get connectAndSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect w/ sign"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeStaticText[`name == "Connect wallet"`]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="TERMINATE"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Terminate"`]',
        ),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="personal_sign"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "personal_sign"`]',
        ),
      }),
    );
  }

  get signTypedDataV4Button(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="eth_signTypedData_v4"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "eth_signTypedData_v4"`]',
        ),
      }),
    );
  }

  get sendTransactionButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Send transaction"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Send transaction"`]',
        ),
      }),
    );
  }

  get switchToPolygonButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Switch to Polygon"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Send transaction"`]',
        ),
      }),
    );
  }

  get switchToMainnetButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Switch to Mainnet"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Send transaction"`]',
        ),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async connectAndSign(): Promise<void> {
    await this.connectAndSignButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async signTypedDataV4(): Promise<void> {
    await this.signTypedDataV4Button.click();
  }

  async personalSign(): Promise<void> {
    await this.personalSignButton.click();
  }

  async sendTransaction(): Promise<void> {
    await this.sendTransactionButton.click();
  }

  async switchToPolygonNetwork(): Promise<void> {
    await this.switchToPolygonButton.click();
  }

  async switchToMainnetNetwork(): Promise<void> {
    await this.switchToMainnetButton.click();
  }
}

const vueJSDappScreen = new VueJSDappScreen();
export default vueJSDappScreen;
