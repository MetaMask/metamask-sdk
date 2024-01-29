import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class AndroidSDKDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect"]',
        ),
      }),
    );
  }

  get connectAndSignButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect and Sign"]',
        ),
      }),
    );
  }

  get connectWithRequestButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect With Request"]',
        ),
      }),
    );
  }

  get clearSessionButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Clear Session"]',
        ),
      }),
    );
  }

  get signButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="SIGN"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (await this.connectButton).click();
  }

  async sign(): Promise<void> {
    await (await this.signButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }
}

const androidSDKDappScreen = new AndroidSDKDappScreen();
export default androidSDKDappScreen;
