import Utils, { MetamaskElement, androidElementTypes } from '../../utils';

class PermissionsPopup {
  private get getPermissionsPopup(): MetamaskElement | undefined {
    return $(
      Utils.getAndroidLocatorByResourceId(
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
      Utils.getAndroidLocatorByTextAndType(
        androidElementTypes.TextView,
        'Chrome',
      ),
    );
    chromePermission.click();

    const setAsDefault = await $(
      Utils.getAndroidLocatorByResourceId(
        androidElementTypes.Button,
        'android:id/button1',
      ),
    );

    setAsDefault.click();
  }
}

export default new PermissionsPopup();
