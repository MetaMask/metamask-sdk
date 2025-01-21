import { ChainablePromiseElement } from 'webdriverio';

import { AndroidSelector } from '@/util/Selectors';
import { getSelectorForPlatform } from '@/util/Utils';
import { Dapp } from '@/screens/interfaces/Dapp';

class AndroidSDKDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect"]',
        ),
      }),
    );
  }

  get connectAndSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect and Sign"]',
        ),
      }),
    );
  }

  get connectWithRequestButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Connect With Request"]',
        ),
      }),
    );
  }

  get clearSessionButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Clear Session"]',
        ),
      }),
    );
  }

  get signButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Sign Message"]',
        ),
      }),
    );
  }

  get signButton2(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Sign Message"])[2]',
        ),
      }),
    );
  }

  get batchSigningButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Batch Signing"]',
        ),
      }),
    );
  }

  get batchSigningButton2(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Batch Signing"])[2]',
        ),
      }),
    );
  }

  get sendTransactionButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Send Transaction"]',
        ),
      }),
    );
  }

  get sendTransactionButton2(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Send Transaction"])[2]',
        ),
      }),
    );
  }

  get switchChainButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Switch Chain"]',
        ),
      }),
    );
  }

  get switchChainButton2(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '(//android.widget.TextView[@text="Switch Chain"])[2]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Disconnect"]',
        ),
      }),
    );
  }

  get backButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@content-desc="Back"]',
        ),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.waitForEnabled({
      timeout: 5000,
    });
    await this.connectButton.click();
  }

  async sign(): Promise<void> {
    await this.signButton.waitForEnabled({
      timeout: 5000,
    });
    await this.signButton.click();
  }

  async sign2(): Promise<void> {
    await this.signButton2.waitForEnabled({
      timeout: 5000,
    });
    await this.signButton2.click();
  }

  async sendTransaction(): Promise<void> {
    await this.sendTransactionButton.waitForEnabled({
      timeout: 5000,
    });
    await this.sendTransactionButton.click();
  }

  async sendTransaction2(): Promise<void> {
    await this.sendTransactionButton2.waitForEnabled({
      timeout: 5000,
    });
    await this.sendTransactionButton2.click();
  }

  async switchChain(): Promise<void> {
    await this.switchChainButton.waitForEnabled({
      timeout: 5000,
    });
    await this.switchChainButton.click();
  }

  async switchChain2(): Promise<void> {
    await this.switchChainButton2.waitForEnabled({
      timeout: 5000,
    });
    await this.switchChainButton2.click();
  }

  async clearSession(): Promise<void> {
    await this.clearSessionButton.waitForEnabled({
      timeout: 5000,
    });
    await this.clearSessionButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.waitForEnabled({
      timeout: 5000,
    });
    await this.backButton.click();
  }

  async connectAndSign(): Promise<void> {
    await this.connectAndSignButton.waitForEnabled({
      timeout: 5000,
    });
    await this.connectAndSignButton.click();
  }

  async connectWithRequest(): Promise<void> {
    await this.connectWithRequestButton.waitForEnabled({
      timeout: 5000,
    });
    await this.connectWithRequestButton.click();
  }

  async batchSigning(): Promise<void> {
    await this.batchSigningButton.waitForEnabled({
      timeout: 5000,
    });
    await this.batchSigningButton.click();
  }

  async batchSigning2(): Promise<void> {
    await this.batchSigningButton2.waitForEnabled({
      timeout: 5000,
    });
    await this.batchSigningButton2.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.waitForEnabled({
      timeout: 5000,
    });
    await this.terminateButton.click();
  }
}

const androidSDKDappScreen = new AndroidSDKDappScreen();
export default androidSDKDappScreen;
