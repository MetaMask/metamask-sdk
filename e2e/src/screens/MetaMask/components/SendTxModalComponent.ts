import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class SendTxModalComponent {
  get confirmButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Confirm"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Confirm"'),
      }),
    );
  }

  get rejectButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (await this.confirmButton).click();
  }

  async reject(): Promise<void> {
    await (await this.rejectButton).click();
  }
}

const sendTxModalComponent = new SendTxModalComponent();
export default sendTxModalComponent;
