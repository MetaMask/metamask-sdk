import { ChainablePromiseElement } from 'webdriverio';
import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class ImportFromSeedScreen {
  get srpInput(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'import-from-seed-screen-seed-phrase-input-id',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: 'label == "Enter your Secret Recovery Phrase"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get firstPasswordInput() {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="create-password-first-input-field"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator: 'label == "New Password"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get secondPasswordInput() {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: '//*[@resource-id="create-password-second-input-field"]',
          strategy: AndroidSelectorStrategies.Xpath,
        },
        iosLocator: {
          locator:
            'label == "Confirm password" AND value != "Confirm password"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get biometricsToggle() {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'new UiSelector().className("android.widget.Switch")',
          strategy: AndroidSelectorStrategies.UIAutomator2,
        },
        iosLocator: {
          locator: 'name == "login-with-biometrics-switch"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  get importButton() {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'import-from-seed-screen-submit-button-id',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator:
            'label == "IMPORT" AND name == "import-from-seed-screen-submit-button-id"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapBiometricsToggleIfDisplayed(): Promise<void> {
    if (!(await this.biometricsToggle.isDisplayed())) {
      return;
    }
    await (await this.biometricsToggle).click();
  }

  async fillSrpField(srp: string): Promise<void> {
    await this.srpInput.setValue(srp);
  }

  async fillFirstPasswordInput(password: string): Promise<void> {
    await this.firstPasswordInput.setValue(password);
  }

  async fillSecondPasswordInput(password: string): Promise<void> {
    await this.secondPasswordInput.setValue(password);
  }

  async tapImportButton(): Promise<void> {
    await this.importButton.click();
  }
}

export default new ImportFromSeedScreen();
