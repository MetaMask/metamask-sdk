import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class WalletSetupScreen {
  get importWithSRP(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().accessibilityId(
          'wallet-setup-screen-import-from-seed-button-id',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'label == "Import using Secret Recovery Phrase"',
        ),
      }),
    );
  }

  async tapImportWithSRP(): Promise<void> {
    await (await this.importWithSRP).click();
  }
}

const walletSetupScreen = new WalletSetupScreen();
export default walletSetupScreen;
