import { ChainablePromiseElement } from 'webdriverio';

import Gestures from '../../Gestures';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class SettingsScreen {
  get securityAndPrivacyButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector:
          AndroidSelector.by().uiAutomatorAndText('Security & Privacy'),
        iosSelector: IOSSelector.by().xpath(
          '//XCUIElementTypeOther[@name="security-settings"]',
        ),
      }),
    );
  }

  get manageConnectionsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="sdk-section"]/android.widget.Button',
        ),
        iosSelector: IOSSelector.by().xpath(
          '//XCUIElementTypeButton[@name="Manage connections"]',
        ),
      }),
    );
  }

  get disconnectAll(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="sdk-session-manager"]/android.widget.Button',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "Disconnect all"',
        ),
      }),
    );
  }

  // Needs Android locator on mobile
  get disconnectButtonList(): ReturnType<WebdriverIO.Browser['$$']> {
    return $$(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(
          'new UiSelector().text("Disconnect")',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Disconnect"'),
      }),
    );
  }

  get acceptClearConnectionsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('CLEAR'),
        iosSelector: IOSSelector.by().predicateString('label == "CLEAR"'),
      }),
    );
  }

  get cancelClearConnectionsButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText('Cancel'),
        iosSelector: IOSSelector.by().predicateString('label == "Cancel"'),
      }),
    );
  }

  get noConnectionsFoundTest(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndText(''),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeStaticText[`label == "No connections found"`]',
        ),
      }),
    );
  }

  async tapManageConnections(): Promise<void> {
    await this.manageConnectionsButton.click();
  }

  async tapDisconnectAll(): Promise<void> {
    await this.disconnectAll.click();
  }

  async tapAcceptClearConnections(): Promise<void> {
    await this.acceptClearConnectionsButton.click();
  }

  async tapCancelClearConnections(): Promise<void> {
    await this.cancelClearConnectionsButton.click();
  }

  async tapSecurityAndPrivacy(): Promise<void> {
    await this.securityAndPrivacyButton.click();
  }

  async clearAllConnections(): Promise<void> {
    await this.tapSecurityAndPrivacy();
    let isDisplayed = await this.manageConnectionsButton.isDisplayed();
    while (!isDisplayed) {
      // Swipe down twice
      await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
      await Gestures.swipeByPercentage({ x: 50, y: 60 }, { x: 50, y: 5 });
      isDisplayed = await this.manageConnectionsButton.isDisplayed();
    }
    await this.tapManageConnections();
    if (await this.noConnectionsFoundTest.isDisplayed()) {
      return;
    }
    await this.tapDisconnectAll();
    await this.tapAcceptClearConnections();
  }
}

const settingsScreen = new SettingsScreen();
export default settingsScreen;
