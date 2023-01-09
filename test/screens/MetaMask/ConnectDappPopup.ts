import { BottomPopup } from '../../atoms/BottomPopup';
import Selectors, { androidElementTypes } from '../../utils/Selectors';

class ConnectDappPopup {
  private get getConnectPopup(): BottomPopup {
    return new BottomPopup({
      selector: Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.ViewGroup,
        'account-approval-modal-container',
      ),
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

export default new ConnectDappPopup();
