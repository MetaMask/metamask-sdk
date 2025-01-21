import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@/util/Utils';
import { AndroidSelector, IOSSelector } from '@/util/Selectors';

class SendTxModalComponent {
  get confirmButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Confirm"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Confirm"'),
      }),
    );
  }

  get rejectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Reject"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Reject"'),
      }),
    );
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async reject(): Promise<void> {
    await this.rejectButton.waitForEnabled({
      timeout: 10000,
    });
    await this.rejectButton.click();
  }
}

const sendTxModalComponent = new SendTxModalComponent();
export default sendTxModalComponent;
