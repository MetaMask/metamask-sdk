import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class DevnextDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect wallet"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Connect"'),
      }),
    );
  }

  get signButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  async sign(): Promise<void> {
    await this.scrollToSignButton();
    await (await this.signButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }

  async scrollToSignButton(): Promise<void> {
    await (await this.signButton).scrollIntoView();
  }
}

const devnextJSDappScreen = new DevnextDappScreen();
export default devnextJSDappScreen;
