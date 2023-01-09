import { MetamaskElement } from '../../utils/Selectors';
import PermissionsPopup from './PermissionsPopup';

class MobileBrowser {
  private get getAddressBar(): MetamaskElement {
    return $('id=com.android.chrome:id/url_bar');
  }

  async tapAddressBar(): Promise<void> {
    await this.getAddressBar.click();
  }

  async fillWebsite(website: string): Promise<void> {
    await this.getAddressBar.setValue(website);
    await driver.pressKeyCode(66);
  }

  async openBrowser(): Promise<void> {
    await browser.activateApp('com.android.chrome');
    if (await PermissionsPopup.isPermissionsPopupDisplayed()) {
      await PermissionsPopup.tapChromePermission();
    }
  }
}

export default new MobileBrowser();
