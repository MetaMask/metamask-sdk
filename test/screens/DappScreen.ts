import Utils, { MetamaskElement, androidElementTypes } from '../utils';

class DappScreen {
  private get connectButtom(): MetamaskElement {
    return $(
      Utils.getAndroidLocatorByTextAndType(
        androidElementTypes.Button,
        'CONNECT',
      ),
    );
  }

  private get addressField(): MetamaskElement {
    return $(
      Utils.getAndroidLocatorByTextAndType(
        androidElementTypes.TextView,
        'Accounts:',
      ),
    );
  }

  async tapSiteConnect(): Promise<void> {
    await this.connectButtom.click();
  }

  async isDappConnectButtonClickable(): Promise<boolean> {
    return await this.connectButtom.isClickable();
  }

  async getAddressFieldText(): Promise<string> {
    return await this.addressField.getText();
  }
}

export default new DappScreen();
