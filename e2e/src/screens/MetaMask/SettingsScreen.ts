import { ChainablePromiseElement} from 'webdriverio';

import Gestures from '../../Gestures';
import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class SettingsScreen {
  get securityAndPrivacyButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("Security & Privacy")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: '//XCUIElementTypeOther[@name="security-settings"]',
          strategy: IOSSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get manageConnectionsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="sdk-section"]/android.widget.Button',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: '//XCUIElementTypeButton[@name="Manage connections"]',
          strategy: IOSSelectorStrategies.Xpath,
        },
      }),
    );
  }

  get disconnectAll(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator:
            '//*[@resource-id="sdk-session-manager"]/android.widget.Button',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "Disconnect all"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get disconnectButtonList(): ReturnType<WebdriverIO.Browser['$$']> {
    return $$(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("Disconnect")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "Disconnect"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get acceptClearConnectionsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("CLEAR")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "CLEAR"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get cancelClearConnectionsButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().text("Cancel")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'label == "Cancel"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get noConnectionsFoundTest(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: '**/XCUIElementTypeStaticText[`label == "No connections found"`]',
          strategy: IOSSelectorStrategies.IOSClassChain,
        },
      }),
    );
  }

  async tapManageConnections(): Promise<void> {
    await (await this.manageConnectionsButton).click();
  }

  async tapDisconnectAll(): Promise<void> {
    await (await this.disconnectAll).click();
  }

  async tapAcceptClearConnections(): Promise<void> {
    await (await this.acceptClearConnectionsButton).click();
  }

  async tapCancelClearConnections(): Promise<void> {
    await (await this.cancelClearConnectionsButton).click();
  }

  async tapSecurityAndPrivacy(): Promise<void> {
    await (await this.securityAndPrivacyButton).click();
  }

  async clearAllConnections(): Promise<void> {
    await this.tapSecurityAndPrivacy();
    let isDisplayed = await this.manageConnectionsButton.isDisplayed();
    while (!isDisplayed) {
      await Gestures.swipeByPercentage({ x: 50, y: 90 }, { x: 50, y: 5 });
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

export default new SettingsScreen();
