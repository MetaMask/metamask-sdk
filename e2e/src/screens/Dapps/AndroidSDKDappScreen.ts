import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelector } from '../../Selectors';
import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';

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
          '//android.widget.TextView[@text="Sign Message"]',
        ),
      }),
    );
  }

  get signButton2(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Sign Message"])[2]',
        ),
      }),
    );
  }

  get batchSigningButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Batch Signing"]',
        ),
      }),
    );
  }

  get batchSigningButton2(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Batch Signing"])[2]',
        ),
      }),
    );
  }

  get sendTransactionButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Send Transaction"]',
        ),
      }),
    );
  }

  get sendTransactionButton2(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Send Transaction"])[2]',
        ),
      }),
    );
  }

  get switchChainButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Switch Chain"]',
        ),
      }),
    );
  }

  get switchChainButton2(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Switch Chain"])[2]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Disconnect"]',
        ),
      }),
    );
  }

  get backButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@content-desc="Back"]',
        ),
      }),
    );
  }

  async connect(): Promise<void> {
    await (
      await this.connectButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.connectButton).click();
  }

  async sign(): Promise<void> {
    await (
      await this.signButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.signButton).click();
  }

  async sign2(): Promise<void> {
    await (
      await this.signButton2
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.signButton2).click();
  }

  async sendTransaction(): Promise<void> {
    await (
      await this.sendTransactionButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.sendTransactionButton).click();
  }

  async sendTransaction2(): Promise<void> {
    await (
      await this.sendTransactionButton2
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.sendTransactionButton2).click();
  }

  async switchChain(): Promise<void> {
    await (
      await this.switchChainButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.switchChainButton).click();
  }

  async switchChain2(): Promise<void> {
    await (
      await this.switchChainButton2
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.switchChainButton2).click();
  }

  async clearSession(): Promise<void> {
    await (
      await this.clearSessionButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.clearSessionButton).click();
  }

  async goBack(): Promise<void> {
    await (
      await this.backButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.backButton).click();
  }

  async connectAndSign(): Promise<void> {
    await (
      await this.connectAndSignButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.connectAndSignButton).click();
  }

  async connectWithRequest(): Promise<void> {
    await (
      await this.connectWithRequestButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.connectWithRequestButton).click();
  }

  async batchSigning(): Promise<void> {
    await (
      await this.batchSigningButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.batchSigningButton).click();
  }

  async batchSigning2(): Promise<void> {
    await (
      await this.batchSigningButton2
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.batchSigningButton2).click();
  }

  async terminate(): Promise<void> {
    await (
      await this.terminateButton
    ).waitForEnabled({
      timeout: 5000,
    });
    await (await this.terminateButton).click();
  }
}

const androidSDKDappScreen = new AndroidSDKDappScreen();
export default androidSDKDappScreen;
