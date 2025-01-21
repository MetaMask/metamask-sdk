import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class EnableSmartTransactionsComponent {
  private get enableSmartTransactions(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath('//*[@text="Enable"]'),
        iosSelector: IOSSelector.by().predicateString('name == "Enable"'),
      }),
    );
  }

  async tapEnableSmartTransactions(): Promise<void> {
    try {
      await this.enableSmartTransactions.waitForEnabled({
        timeout: 10000,
      });
      await this.enableSmartTransactions.click();
    } catch (e) {
      console.error(
        'Error enabling smart transactions. Assuming it wasnt displayed and wont be: ',
        e,
      );
    }
  }
}

const enableSmartTransactionsComponent = new EnableSmartTransactionsComponent();
export default enableSmartTransactionsComponent;
