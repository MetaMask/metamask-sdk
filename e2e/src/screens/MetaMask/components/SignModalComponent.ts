import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../../Utils';
import { AndroidSelector, IOSSelector } from '../../../Selectors';

class SignModalComponent {
  get signApprovalButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-confirm-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@content-desc="request-signature-cancel-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Cancel"'),
      }),
    );
  }

  async tapSignApproval(): Promise<void> {
    await (await this.signApprovalButton).waitForDisplayed({ timeout: 10000 });
    await (await this.signApprovalButton).click();
  }

  async tapCancel(): Promise<void> {
    await (await this.cancelButton).click();
  }
}

const signModalComponent = new SignModalComponent();
export default signModalComponent;
