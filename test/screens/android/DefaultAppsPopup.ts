import Selectors, {
  MetamaskElement,
  androidElementTypes,
} from '../../utils/Selectors';

class DefaultAppsPopup {
  private get getDefaultAppsScrollView(): MetamaskElement | undefined {
    return $(
      Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.ScrollView,
        'android:id/contentPanel',
      ),
    );
  }

  private get getMetaMaskOption(): MetamaskElement | undefined {
    return $(
      Selectors.getAndroidLocatorByTextAndType(
        androidElementTypes.TextView,
        'MetaMask-QA',
      ),
    );
  }

  private get firstOption(): MetamaskElement | undefined {
    return $(
      Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.TextView,
        'android:id/title',
      ),
    );
  }

  private get alwaysOpenWithMetaMask(): MetamaskElement | undefined {
    return $(
      Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.Button,
        'android:id/button_always',
      ),
    );
  }

  async isDefaultAppsPopupDisplayed(): Promise<boolean> {
    return (await this.getDefaultAppsScrollView?.isDisplayed()) ?? false;
  }

  async isMetaMaskQATheFirstOption(): Promise<boolean> {
    return (await this.firstOption?.getText()) === 'Open with MetaMask-QA';
  }

  async tapAlwaysOpenWithMetaMask(): Promise<void> {
    await this.alwaysOpenWithMetaMask?.click();
  }

  async selectMetaMask(): Promise<void> {
    await this.getMetaMaskOption?.click();
    await this.tapAlwaysOpenWithMetaMask();
  }
}

export default new DefaultAppsPopup();
