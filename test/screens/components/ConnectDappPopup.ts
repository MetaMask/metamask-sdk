import { BottomPopup } from '../../atoms/BottomPopup';
import Utils, { androidElementTypes } from '../../utils';

class ConnectDappPopup {
  private get getConnectPopup(): BottomPopup {
    return new BottomPopup({
      selector: Utils.getAndroidLocatorByResourceId(
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
}

export default new ConnectDappPopup();
