import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { AndroidSelector, IOSSelector } from '../../Selectors';
import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';

class SdkPlaygroundDappScreen implements Dapp {
  get demoProviderButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get personalSignButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get signTypedDataV4Button(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get sendTransactionButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get sendBatchRpcCallsButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get switchToPolygonButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get switchToGoerliButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get chainSwitchAndSignAndSwitchBackButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get chainSwitchAndSignAndSendTxButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Terminate"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Terminate"'),
      }),
    );
  }

  get dropdownSettingsArrowButton(): ChainablePromiseElement<WebdriverIO.Element> {
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

  get toggleDeeplinkButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await this.scrollToElement(this.connectButton);
    await (await this.connectButton).click();
  }

  async tapDropdownSettingsArrowButton(): Promise<void> {
    await (await this.dropdownSettingsArrowButton).click();
  }

  async tapToggleDeeplinkButton(): Promise<void> {
    await (await this.toggleDeeplinkButton).click();
  }

  async signTypedDataV4(): Promise<void> {
    await this.scrollToElement(this.signTypedDataV4Button);
    await (await this.signTypedDataV4Button).click();
  }

  async personalSign(): Promise<void> {
    await this.scrollToElement(this.personalSignButton);
    await (await this.personalSignButton).click();
  }

  async sendTransaction(): Promise<void> {
    await this.scrollToElement(this.sendTransactionButton);
    await (await this.sendTransactionButton).click();
  }

  async tapDemoProviderButton(): Promise<void> {
    await this.scrollToElement(this.demoProviderButton);
    await (await this.demoProviderButton).click();
  }

  async terminate(): Promise<void> {
    await this.scrollToElement(this.terminateButton);
    await (await this.terminateButton).click();
  }

  async switchToGoerliNetwork(): Promise<void> {
    await this.scrollToElement(this.switchToGoerliButton);
    await (await this.switchToGoerliButton).click();
  }

  async switchToPolygonNetwork(): Promise<void> {
    await this.scrollToElement(this.switchToPolygonButton);
    await (await this.switchToPolygonButton).click();
  }

  async chainSwitchAndSignAndSendTx(): Promise<void> {
    await this.scrollToElement(this.chainSwitchAndSignAndSendTxButton);
    await (await this.chainSwitchAndSignAndSendTxButton).click();
  }

  async sendBatchRpcCalls(): Promise<void> {
    await this.scrollToElement(this.sendBatchRpcCallsButton);
    await (await this.sendBatchRpcCallsButton).click();
  }

  async chainSwitchAndSignAndSwitchBack(): Promise<void> {
    await this.scrollToElement(this.chainSwitchAndSignAndSwitchBackButton);
    await (await this.chainSwitchAndSignAndSwitchBackButton).click();
  }

  async scrollToElement(
    element: ChainablePromiseElement<WebdriverIO.Element>,
  ): Promise<void> {
    if (driver.isAndroid) {
      let isMetaMaskLinksButtonDisplayed = await (await element).isDisplayed();

      while (!isMetaMaskLinksButtonDisplayed) {
        await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
        isMetaMaskLinksButtonDisplayed = await (await element).isDisplayed();
      }
    }
  }
}

const sdkPlaygroundDappScreen = new SdkPlaygroundDappScreen();
export default sdkPlaygroundDappScreen;
