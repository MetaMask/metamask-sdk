import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector } from '../../../Selectors';

class AndroidOpenWithComponent {
  get openWithMetaMaskQA(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('MetaMask-QA'),
      }),
    );
  }

  get openWithMetaMask(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('MetaMask'),
      }),
    );
  }

  async tapOpenWithMetaMaskQA(): Promise<void> {
    await (
      await this.openWithMetaMaskQA
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.openWithMetaMaskQA).click();
  }

  async tapOpenWithMetaMask(): Promise<void> {
    await (
      await this.openWithMetaMask
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.openWithMetaMask).click();
  }
}

const androidOpenWithComponent = new AndroidOpenWithComponent();
export default androidOpenWithComponent;
