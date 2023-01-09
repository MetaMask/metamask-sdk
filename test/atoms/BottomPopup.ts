import { MetamaskElement } from '../utils/Selectors';
import { IBottomPopup } from '../interfaces/IBottomPopup';

export class BottomPopup implements IBottomPopup {
  e: MetamaskElement;

  approveButton: MetamaskElement;

  cancelButton: MetamaskElement;

  constructor({
    selector,
    cancelButtonSelector,
    approveButtonSelector,
  }: {
    selector: string;
    cancelButtonSelector: string;
    approveButtonSelector: string;
  }) {
    this.e = $(selector);
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
