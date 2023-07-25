import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelectorStrategies } from '../../../Strategies';
import Utils from '../../../Utils';

class AndroidOpenWithComponent {
  get openWithMetaMaskQA(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("MetaMask-QA")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
      }),
    );
  }

  get openWithMetaMask(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("MetaMask")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
      }),
    );
  }

  async tapOpenWithMetaMaskQA(): Promise<void> {
    await (await this.openWithMetaMaskQA).click();
  }

  async tapOpenWithMetaMask(): Promise<void> {
    await (await this.openWithMetaMask).click();
  }
}

const androidOpenWithComponent = new AndroidOpenWithComponent();
export default androidOpenWithComponent;
