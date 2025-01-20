import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class CreateReactAppDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Connect"`]',
        ),
      }),
    );
  }

  get connectAndSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect w/ Sign"]',
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
          '//android.widget.Button[@text="Terminate"]',
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
}

const createReactAppDappScreen = new CreateReactAppDappScreen();
export default createReactAppDappScreen;
