import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector, IOSSelector } from '@util/selectors';

class WalletSetupScreen {
  get importWithSRP(): ChainablePromiseElement {
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
    await this.importWithSRP.click();
  }
}

const walletSetupScreen = new WalletSetupScreen();
export default walletSetupScreen;
