import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class NextJSDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('Connect'),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  // Currently there's no terminate in create-react-dapp
  get terminateButton(): ChainablePromiseElement {
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
    await this.connectButton.click();
  }

  async sign(): Promise<void> {
    await this.scrollToSignButton();
    await this.signButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.click();
  }

  async scrollToSignButton(): Promise<void> {
    await this.signButton.scrollIntoView();
  }
}

const nextJSDappScreen = new NextJSDappScreen();
export default nextJSDappScreen;
