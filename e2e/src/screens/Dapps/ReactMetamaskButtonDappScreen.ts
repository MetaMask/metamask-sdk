import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelector, IOSSelector } from '../../Selectors';
import { getSelectorForPlatform } from '../../Utils';

class ReactMetamaskButtonDappScreen {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect wallet"]',
        ),
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeStaticText[`name == "Connect wallet"`]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Terminate"]',
        ),
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeButton[`name == "Terminate"`]',
        ),
      }),
    );
  }

  async connect(): Promise<void> {
    await (await this.connectButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }
}

const createReactDappScreen = new ReactMetamaskButtonDappScreen();
export default createReactDappScreen;
