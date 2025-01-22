import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { Dapp } from '@screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class ReactNativeDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="CONNECT"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="SIGN"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Terminate"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Terminate"'),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async sign(): Promise<void> {
    await this.signButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async isDappConnected(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

const reactNativeDappScreen = new ReactNativeDappScreen();
export default reactNativeDappScreen;
