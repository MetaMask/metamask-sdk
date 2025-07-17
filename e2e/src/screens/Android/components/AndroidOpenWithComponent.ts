import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector } from '@util/selectors';

class AndroidOpenWithComponent {
  get openWithMetaMaskQA(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('MetaMask-QA'),
      }),
    );
  }

  get openWithMetaMask(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('MetaMask'),
      }),
    );
  }

  async tapOpenWithMetaMaskQA(): Promise<void> {
    await this.openWithMetaMaskQA.waitForEnabled({
      timeout: 10000,
    });
    await this.openWithMetaMaskQA.click();
  }

  async tapOpenWithMetaMask(): Promise<void> {
    await this.openWithMetaMask.waitForEnabled({
      timeout: 10000,
    });
    await this.openWithMetaMask.click();
  }
}

const androidOpenWithComponent = new AndroidOpenWithComponent();
export default androidOpenWithComponent;
