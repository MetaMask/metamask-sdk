import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { IOSSelector } from '../../Selectors';

class IOSNNativeDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString(
          'label == "Connect to MetaMask"',
        ),
      }),
    );
  }

  get signMenuButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString(
          'label == "Sign" AND name == "Sign" AND type == "XCUIElementTypeButton"',
        ),
      }),
    );
  }

  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString(
          'label == "Sign message"',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        iosSelector: IOSSelector.by().predicateString('label == "Terminate"'),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async sign(): Promise<void> {
    await this.signMenuButton.click();
    await this.signButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }
}

const iosNativeDappScreen = new IOSNNativeDappScreen();
export default iosNativeDappScreen;
