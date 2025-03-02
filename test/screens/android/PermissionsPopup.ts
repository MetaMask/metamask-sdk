import Selectors, {
  MetamaskElement,
  androidElementTypes,
} from '../../utils/Selectors';

class PermissionsPopup {
  private get getPermissionsPopup(): MetamaskElement | undefined {
    return $(
      Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.TextView,
        'com.android.permissioncontroller:id/title',
      ),
    );
  }

  async isPermissionsPopupDisplayed(): Promise<boolean> {
    return (await this.getPermissionsPopup?.isDisplayed()) ?? false;
  }

  async tapChromePermission(): Promise<void> {
    const chromePermission = await $(
      Selectors.getAndroidLocatorByTextAndType(
        androidElementTypes.TextView,
        'Chrome',
      ),
    );
    chromePermission.click();

    const setAsDefault = await $(
      Selectors.getAndroidLocatorByResourceId(
        androidElementTypes.Button,
        'android:id/button1',
      ),
    );

    setAsDefault.click();
  }
}

export default new PermissionsPopup();
