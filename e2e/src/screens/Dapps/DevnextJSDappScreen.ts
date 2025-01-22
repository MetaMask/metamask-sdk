import { ChainablePromiseElement } from 'webdriverio';

import { visibilityOf } from 'wdio-wait-for';
import { getSelectorForPlatform, scrollToElement } from '@util/Utils';
import { Dapp } from '@screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class DevnextDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@text="Connect wallet"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Connect wallet"',
        ),
      }),
    );
  }

  // TODO: Add iOS Locator when adding the personal_sign test case
  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="personal_sign"]',
        ),
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

  // TODO:
  //  Improve devnext dapp to have a better way to locate the connected status
  //  status
  get connectedStatus(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="YES"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "YES"'),
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
    await scrollToElement(this.terminateButton);
    await this.terminateButton.click();
  }

  async scrollToSignButton(): Promise<void> {
    await this.signButton.scrollIntoView();
  }

  async tapPersonalSignButton(): Promise<void> {
    await scrollToElement(this.personalSignButton);
    await this.personalSignButton.click();
  }

  async isDappConnected(): Promise<boolean> {
    const isConnected = await driver.waitUntil(
      visibilityOf(this.connectedStatus),
      {
        timeout: 10000,
        timeoutMsg: 'Dapp is not connected!',
      },
    );
    return Boolean(isConnected);
  }
}

const devnextJSDappScreen = new DevnextDappScreen();
export default devnextJSDappScreen;
