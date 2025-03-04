import { MetamaskElement } from '../utils/Selectors';
import { IBottomPopup } from '../interfaces/IBottomPopup';

export class BottomPopup implements IBottomPopup {
  e: MetamaskElement;

  approveButton: MetamaskElement;

  cancelButton: MetamaskElement;

  constructor({
    androidSelector,
    iOSSelector,
    cancelButtonSelector,
    approveButtonSelector,
  }: {
    androidSelector?: string;
    iOSSelector?: string;
    cancelButtonSelector: string;
    approveButtonSelector: string;
  }) {
    const platform = driver.isAndroid ? 'android' : 'ios';
    if (platform === 'android' && androidSelector) {
      this.e = $(`${androidSelector}`);
    } else if (platform === 'ios' && iOSSelector) {
      if (iOSSelector.startsWith('~')) {
        this.e = $(`${iOSSelector}`);
      } else {
        this.e = $(`-ios class chain:${iOSSelector}`);
      }
    } else {
      throw new Error(`No selector provided for platform ${platform}`);
    }

    this.approveButton = $(approveButtonSelector);
    this.cancelButton = $(cancelButtonSelector);
  }

  async tapApproveButton(): Promise<void> {
    await this.approveButton.click();
  }

  async tapCancelButton(): Promise<void> {
    await this.cancelButton.click();
  }

  async getApproveButtonText(): Promise<string> {
    return await this.approveButton.getText();
  }

  async getCancelButtonText(): Promise<string> {
    return await this.cancelButton.getText();
  }

  async isDisplayed(): Promise<boolean> {
    return await this.e.isDisplayed();
  }

  async waitForDisplayed(): Promise<void | true> {
    return await this.e.waitForDisplayed({ timeout: 50000 });
  }
}
