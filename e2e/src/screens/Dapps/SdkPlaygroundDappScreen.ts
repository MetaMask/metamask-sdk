import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '@util/Gestures';
import { AndroidSelector, IOSSelector } from '@util/Selectors';
import { getSelectorForPlatform } from '@util/Utils';
import { Dapp } from '@screens/interfaces/Dapp';

class SdkPlaygroundDappScreen implements Dapp {
  get demoProviderButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Demo Provider"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Demo Provider" AND label == "Demo Provider" AND value == "Demo Provider"',
        ),
      }),
    );
  }

  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Connect"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Connect"'),
      }),
    );
  }

  get personalSignButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="personal_sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "personal_sign"',
        ),
      }),
    );
  }

  get signTypedDataV4Button(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="eth_signTypedData_v4"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "eth_signTypedData_v4"',
        ),
      }),
    );
  }

  get sendTransactionButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Send transaction"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Send transaction"',
        ),
      }),
    );
  }

  get sendBatchRpcCallsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Chain RPC Calls"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Chain RPC Calls"',
        ),
      }),
    );
  }

  get switchToPolygonButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Switch to Polygon"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Switch to Polygon"',
        ),
      }),
    );
  }

  get switchToGoerliButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Switch to Goerli"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Switch to Goerli"',
        ),
      }),
    );
  }

  get chainSwitchAndSignAndSwitchBackButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Chain Switch + sign + switch back"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Chain Switch + sign + switch back"',
        ),
      }),
    );
  }

  get chainSwitchAndSignAndSendTxButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Chain sendTransaction + personal_sign + sendTransaction"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Chain sendTransaction + personal_sign + sendTransaction"',
        ),
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
        iosSelector: IOSSelector.by().predicateString('name == "Terminate"'),
      }),
    );
  }

  get dropdownSettingsArrowButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@resource-id="root"]/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.view.View[1]/android.view.View[3]/android.view.View/android.view.View[3]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "" AND label == "" AND type == "XCUIElementTypeButton"',
        ),
      }),
    );
  }

  get toggleDeeplinkButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@text="Toggle Deeplink"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "Toggle Deeplink"',
        ),
      }),
    );
  }

  async connect(): Promise<void> {
    await this.connectButton.waitForEnabled({
      timeout: 10000,
    });
    await this.connectButton.click();
  }

  async tapDropdownSettingsArrowButton(): Promise<void> {
    await this.dropdownSettingsArrowButton.waitForEnabled({
      timeout: 10000,
    });
    await this.dropdownSettingsArrowButton.click();
  }

  async tapToggleDeeplinkButton(): Promise<void> {
    await this.toggleDeeplinkButton.waitForEnabled({
      timeout: 10000,
    });
    await this.toggleDeeplinkButton.click();
  }

  async signTypedDataV4(): Promise<void> {
    await this.scrollToElement(this.signTypedDataV4Button);
    await this.signTypedDataV4Button.waitForEnabled({
      timeout: 10000,
    });
    await this.signTypedDataV4Button.click();
  }

  async personalSign(): Promise<void> {
    await this.scrollToElement(this.personalSignButton);
    await this.personalSignButton.waitForEnabled({
      timeout: 10000,
    });
    await this.personalSignButton.click();
  }

  async sendTransaction(): Promise<void> {
    await this.scrollToElement(this.sendTransactionButton);
    await this.sendTransactionButton.waitForEnabled({
      timeout: 10000,
    });
    await this.sendTransactionButton.click();
  }

  async tapDemoProviderButton(): Promise<void> {
    await this.scrollToElement(this.demoProviderButton);
    await this.demoProviderButton.waitForEnabled({
      timeout: 10000,
    });
    await this.demoProviderButton.click();
  }

  async terminate(): Promise<void> {
    await this.scrollToElement(this.terminateButton);
    await this.terminateButton.waitForEnabled({
      timeout: 10000,
    });
    await this.terminateButton.click();
  }

  async switchToGoerliNetwork(): Promise<void> {
    await this.scrollToElement(this.switchToGoerliButton);
    await this.switchToGoerliButton.waitForEnabled({
      timeout: 10000,
    });
    await this.switchToGoerliButton.click();
  }

  async switchToPolygonNetwork(): Promise<void> {
    await this.scrollToElement(this.switchToPolygonButton);
    await this.switchToPolygonButton.waitForEnabled({
      timeout: 10000,
    });
    await this.switchToPolygonButton.click();
  }

  async chainSwitchAndSignAndSendTx(): Promise<void> {
    await this.scrollToElement(this.chainSwitchAndSignAndSendTxButton);
    await this.chainSwitchAndSignAndSendTxButton.waitForEnabled({
      timeout: 10000,
    });
    await this.chainSwitchAndSignAndSendTxButton.click();
  }

  async sendBatchRpcCalls(): Promise<void> {
    await this.scrollToElement(this.sendBatchRpcCallsButton);
    await this.sendBatchRpcCallsButton.waitForEnabled({
      timeout: 10000,
    });
    await this.sendBatchRpcCallsButton.click();
  }

  async chainSwitchAndSignAndSwitchBack(): Promise<void> {
    await this.scrollToElement(this.chainSwitchAndSignAndSwitchBackButton);
    await this.chainSwitchAndSignAndSwitchBackButton.waitForEnabled({
      timeout: 10000,
    });
    await this.chainSwitchAndSignAndSwitchBackButton.click();
  }

  async scrollToElement(element: ChainablePromiseElement): Promise<void> {
    if (driver.isAndroid) {
      let isMetaMaskLinksButtonDisplayed = await element.isDisplayed();

      while (!isMetaMaskLinksButtonDisplayed) {
        await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
        isMetaMaskLinksButtonDisplayed = await element.isDisplayed();
      }
    }
  }

  async isDappConnected(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

const sdkPlaygroundDappScreen = new SdkPlaygroundDappScreen();
export default sdkPlaygroundDappScreen;
