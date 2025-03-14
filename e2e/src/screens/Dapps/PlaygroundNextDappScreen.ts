import { ChainablePromiseElement } from 'webdriverio';
import { visibilityOf } from 'wdio-wait-for';

import { getSelectorForPlatform } from '@util/Utils';
import { Dapp } from '@screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class PlaygroundNextDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect MetaMask"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Connect MetaMask"',
        ),
      }),
    );
  }

  get addressContainer(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View', // TODO
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeStaticText[`name == "Address:"`]',
        ),
      }),
    );
  }

  get connectAndSignButton(): ChainablePromiseElement {
    throw new Error('Not implemented');
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Terminate Connection"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Terminate Connection"',
        ),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Personal Sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Personal Sign"',
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
    throw new Error('Not implemented');
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
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

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async isDappConnected(): Promise<boolean> {
    const isAddressContainerDisplayed = await driver.waitUntil(
      visibilityOf(this.addressContainer),
      {
        timeout: 10000,
      },
    );
    return isAddressContainerDisplayed;
  }

  async tapPersonalSignButton(): Promise<void> {
    await this.personalSignButton.click();
  }
}

const playgroundNextDappScreen = new PlaygroundNextDappScreen();
export default playgroundNextDappScreen;
