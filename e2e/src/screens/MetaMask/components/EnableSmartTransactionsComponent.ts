import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class EnableSmartTransactionsComponent {
  private get dontEnableSmartTransactions(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.view.View[@text="Enable"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Enable"'),
      }),
    );
  }

  async tapDontEnableSmartTransactions(): Promise<void> {
    await (
      await this.dontEnableSmartTransactions
    ).waitForEnabled({
      timeout: 10000,
    });
    await (await this.dontEnableSmartTransactions).click();
  }
}

const enableSmartTransactionsComponent = new EnableSmartTransactionsComponent();
export default enableSmartTransactionsComponent;
