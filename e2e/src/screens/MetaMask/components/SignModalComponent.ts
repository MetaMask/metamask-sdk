import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class SignModalComponent {
  get signApprovalButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.TextView[@text="Sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Sign"'),
      }),
    );
  }

  get cancelButton(): ChainablePromiseElement {
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
    await this.signApprovalButton.waitForDisplayed({
      timeout: 5000,
    });

    await this.signApprovalButton.waitForEnabled({
      timeout: 10000,
    });
    await this.signApprovalButton.click();
  }

  async tapCancel(): Promise<void> {
    await this.cancelButton.click();
  }
}

const signModalComponent = new SignModalComponent();
export default signModalComponent;
