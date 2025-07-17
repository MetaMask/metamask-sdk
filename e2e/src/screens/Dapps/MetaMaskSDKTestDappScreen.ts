import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform, getWebViewElementText } from '@util/utils';
import { swipeToElement } from '@util/gestures';
import { Dapp } from '@screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@util/selectors';

class MetaMaskSDKTestDappScreen implements Dapp {
  private connectionStatusLocator = '[data-testid="connection-status"]';

  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="connect-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="connect-button"]',
        ),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="terminate-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="terminate-button"]',
        ),
      }),
    );
  }

  get switchToLineaSepoliaButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="switch-linea-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="switch-linea-button"]',
        ),
      }),
    );
  }

  get switchToMainnetButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="switch-mainnet-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="switch-mainnet-button"]',
        ),
      }),
    );
  }

  get switchToPolygonButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="switch-polygon-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="switch-polygon-button"]',
        ),
      }),
    );
  }

  get clearUIStateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="clear-ui-buttonn"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="clear-ui-button"]',
        ),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@data-testid="personal-sign-button"]',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//*[@data-testid="personal-sign-button"]',
        ),
      }),
    );
  }

  get connectionStatusContainer(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          this.connectionStatusLocator,
        ),
        iosSelector: IOSSelector.by().xpath(this.connectionStatusLocator),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.click();
  }

  async terminate(): Promise<void> {
    await swipeToElement(this.terminateButton);
    await this.terminateButton.click();
  }

  async tapPersonalSignButton(): Promise<void> {
    await swipeToElement(this.personalSignButton);
    await this.personalSignButton.click();
  }

  async isDappConnected(): Promise<boolean> {
    const maxRetries = 5;
    const retryInterval = 1000;
    for (let i = 0; i < maxRetries; i++) {
      const connectionStatus = await getWebViewElementText(
        this.connectionStatusLocator,
      );
      if (connectionStatus.includes('Yes')) {
        return true;
      }
      await driver.pause(retryInterval);
    }
    return false;
  }
}

const metaMaskSDKTestDappScreen = new MetaMaskSDKTestDappScreen();
export default metaMaskSDKTestDappScreen;
