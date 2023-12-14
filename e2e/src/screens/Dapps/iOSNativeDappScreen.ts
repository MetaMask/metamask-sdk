import { ChainablePromiseElement } from 'webdriverio';

import { IOSSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';
import { Dapp } from '../interfaces/Dapp';

class IOSNNativeDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "Connect to MetaMask"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get signMenuButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator:
            'label == "Sign" AND name == "Sign" AND type == "XCUIElementTypeButton"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get signButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "Sign message"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        iosLocator: {
          locator: 'label == "Terminate"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async connect(): Promise<void> {
    console.log('Im inside dappConnect');
    await (await this.connectButton).click();
  }

  async sign(): Promise<void> {
    await (await this.signMenuButton).click();
    await (await this.signButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }
}

const iosNativeDappScreen = new IOSNNativeDappScreen();
export default iosNativeDappScreen;
