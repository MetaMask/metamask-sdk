import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelector, IOSSelector } from '@/util/Selectors';
import { getSelectorForPlatform } from '@/util/Utils';

class ReactMetamaskButtonDappScreen {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect wallet"]',
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

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async isDappTerminated(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

const createReactDappScreen = new ReactMetamaskButtonDappScreen();
export default createReactDappScreen;
