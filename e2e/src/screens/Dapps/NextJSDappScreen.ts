import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelectorStrategies, IOSSelectorStrategies } from '../../Strategies';
import Utils from '../../Utils';
import { Dapp } from '../interfaces/Dapp';

class NextJSDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("Connect")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "Connect"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get signButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.TextView[@text="Sign"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Sign"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  // Currently there's no terminate in create-react-dapp
  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//android.widget.Button[@text="Terminate"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Terminate"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
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

const nextJSDappScreen = new NextJSDappScreen();
export default nextJSDappScreen;
