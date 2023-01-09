import Selectors, {
  MetamaskElement,
  androidElementTypes,
} from '../../utils/Selectors';

class DappScreen {
  private get connectButton(): MetamaskElement {
    return $(
      Selectors.getAndroidLocatorByTextAndType(
        androidElementTypes.Button,
        'Connect',
      ),
    );
  }

  private get addressField(): MetamaskElement {
    return $(
      Selectors.getAndroidLocatorByTextAndType(
        androidElementTypes.TextView,
        'Accounts:',
      ),
    );
  }

  async tapSiteConnect(): Promise<void> {
    await this.connectButton.click();
  }

  async isDappConnectButtonClickable(): Promise<boolean> {
    return await this.connectButton.isClickable();
  }

  async getAddressFieldText(): Promise<string> {
    return await this.addressField.getText();
  }
}

export default new DappScreen();
