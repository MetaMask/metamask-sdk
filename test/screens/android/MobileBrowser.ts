import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import PermissionsPopup from './PermissionsPopup';

class MobileBrowser {
  private get getAddressBar(): Input {
    return new Input({
      androidSelector: `id=com.android.chrome:id/url_bar`,
      iOSSelector:
        '**/XCUIElementTypeOther[`name == "CapsuleViewController"`]/XCUIElementTypeOther[3]/XCUIElementTypeOther[2]',
    });
  }

  private get getKeyboardEnterButton(): Button {
    return new Button({
      androidSelector: '',
      iOSSelector: '**/XCUIElementTypeButton[`label == "go"`]',
    });
  }

  async fillWebsite(website: string): Promise<void> {
    await this.getAddressBar.setValue(website);
    if (await driver.isAndroid) {
      await driver.pressKeyCode(66);
    } else {
      await this.getKeyboardEnterButton.tap();
    }
  }

  async launchBrowser(): Promise<void> {
    if (await driver.isAndroid) {
      await browser.activateApp('com.android.chrome');
      if (await PermissionsPopup.isPermissionsPopupDisplayed()) {
        await PermissionsPopup.tapChromePermission();
      }
    } else {
      await browser.activateApp('com.apple.mobilesafari');
    }
  }
}

export default MobileBrowser;
