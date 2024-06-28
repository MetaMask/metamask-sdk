import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class EnableSmartTransactionsComponent {
  private get enableSmartTransactions(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath('//*[@text="Enable"]'),
        iosSelector: IOSSelector.by().predicateString('name == "Enable"'),
      }),
    );
  }

  async tapEnableSmartTransactions(): Promise<void> {
    await (
      await this.enableSmartTransactions
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.enableSmartTransactions).click();
  }
}

const enableSmartTransactionsComponent = new EnableSmartTransactionsComponent();
export default enableSmartTransactionsComponent;
