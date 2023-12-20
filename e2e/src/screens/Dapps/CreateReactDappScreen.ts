import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class CreateReactDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@text="Connect wallet"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="personal_sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get signTypedDataV4Button(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="eth_signTypedData_v4"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get sendTransactionButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Send transaction"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  // Currently there's no terminate in create-react-dapp
  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Terminate"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Terminate"'),
      }),
    );
  }

  async connect(): Promise<void> {
    await (await this.connectButton).click();
  }

  async signTypedDataV4(): Promise<void> {
    await (await this.signTypedDataV4Button).click();
  }

  async personalSign(): Promise<void> {
    await (await this.personalSignButton).click();
  }

  async sendTransaction(): Promise<void> {
    await (await this.sendTransactionButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }
}

const createReactDappScreen = new CreateReactDappScreen();
export default createReactDappScreen;
