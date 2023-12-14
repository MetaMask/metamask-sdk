import { ChainablePromiseElement } from 'webdriverio';
import {
  AndroidSelectorStrategies,
  IOSSelectorStrategies,
} from '../../Strategies';
import Utils from '../../Utils';

class WalletSetupScreen {
  get importWithSRP(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      Utils.getLocatorPerPlatformAndStrategy({
        androidLocator: {
          locator: 'wallet-setup-screen-import-from-seed-button-id',
          strategy: AndroidSelectorStrategies.AccessibilityID,
        },
        iosLocator: {
          locator: 'label == "Import using Secret Recovery Phrase"',
          strategy: IOSSelectorStrategies.IOSPredicateString,
        },
      }),
    );
  }

  async tapImportWithSRP(): Promise<void> {
    await (await this.importWithSRP).click();
  }
}

const walletSetupScreen = new WalletSetupScreen();
export default walletSetupScreen;
