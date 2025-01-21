import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class ImportFromSeedScreen {
  get srpInput(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="import-from-seed-screen-seed-phrase-input-id"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "Enter your Secret Recovery Phrase"',
        ),
      }),
    );
  }

  get firstPasswordInput() {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="create-password-first-input-field"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "New Password"',
        ),
      }),
    );
  }

  get secondPasswordInput() {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="create-password-second-input-field"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "Confirm password" AND value != "Confirm password"',
        ),
      }),
    );
  }

  get biometricsToggle() {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().uiAutomatorAndClassName(
          'android.widget.Switch',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "login-with-biometrics-switch"',
        ),
      }),
    );
  }

  get importButton() {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().accessibilityId(
          'import-from-seed-screen-submit-button-id',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "IMPORT" AND name == "import-from-seed-screen-submit-button-id"',
        ),
      }),
    );
  }

  async tapBiometricsToggleIfDisplayed(): Promise<void> {
    if (await this.biometricsToggle.isDisplayed()) {
      await this.biometricsToggle.click();
    }
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

const importFromSeedScreen = new ImportFromSeedScreen();
export default importFromSeedScreen;
