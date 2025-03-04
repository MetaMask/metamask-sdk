import { BottomPopup } from '../../../atoms/BottomPopup';

class ConnectDappPopup {
  private get getConnectPopup(): BottomPopup {
    return new BottomPopup({
      androidSelector: `//android.view.ViewGroup[@resource-id='account-approval-modal-container']`,
      iOSSelector: '~account-approval-modal-container',
      cancelButtonSelector: '~connect-cancel-button',
      approveButtonSelector: '~connect-approve-button',
    });
  }

  async tapConnect(): Promise<void> {
    await this.getConnectPopup.tapApproveButton();
  }

  async tapCancel(): Promise<void> {
    await this.getConnectPopup.tapCancelButton();
  }

  async isConnectPopupDisplayed(): Promise<boolean> {
    await this.getConnectPopup.waitForDisplayed();
    return await this.getConnectPopup.isDisplayed();
  }
}

export default ConnectDappPopup;
