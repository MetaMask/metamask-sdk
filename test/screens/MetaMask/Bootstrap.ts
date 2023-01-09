import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { Image } from '../../atoms/Image';

class BootstrapScreen {
  private get getStartedButton(): Button {
    return new Button({
      androidSelector: '~welcome-screen-get-started-button-id',
    });
  }

  private get MMFox(): Image {
    return new Image('splash-screen-metamask-animation-id');
  }

  private get importWithSRP(): Button {
    return new Button({
      androidSelector: '~wallet-setup-screen-import-from-seed-button-id',
    });
  }

  private get noThanksOptinMetrics(): Button {
    return new Button({
      androidSelector: '~optin-metrics-no-thanks-button-id',
    });
  }

  private get srpField(): Input {
    return new Input({
      androidSelector: '~import-from-seed-screen-seed-phrase-input-id',
    });
  }

  private get firstPasswordInput(): Input {
    return new Input({
      androidSelector: `//android.widget.EditText[@text='New Password']`,
    });
  }

  private get secondPasswordInput(): Input {
    return new Input({
      androidSelector: `//android.widget.EditText[@text='Confirm password']`,
    });
  }

  private get importButton(): Button {
    return new Button({
      androidSelector: '~import-from-seed-screen-submit-button-id',
    });
  }

  private get noThanksSecutityUpdates(): Button {
    return new Button({ androidSelector: `//*[@text='No thanks']` });
  }

  async tapGetStarted(): Promise<void> {
    await this.getStartedButton.tap();
  }

  async isMMFoxDisplayed(): Promise<boolean> {
    return await this.MMFox.isDisplayed();
  }

  async isMMFoxInViewPort(): Promise<boolean> {
    return await this.MMFox.isVisible();
  }

  async tapImportWithSRP(): Promise<void> {
    await this.importWithSRP.tap();
  }

  async fillSrpField(srp: string): Promise<void> {
    await this.srpField.setValue(srp);
  }

  async fillFirstPasswordInput(password: string): Promise<void> {
    await this.firstPasswordInput.setValue(password);
  }

  async fillSecondPasswordInput(password: string): Promise<void> {
    await this.secondPasswordInput.setValue(password);
  }

  async tapImportButton(): Promise<void> {
    await this.importButton.tap();
  }

  async tapNoThanksOptinMetrics(): Promise<void> {
    await this.noThanksOptinMetrics.tap();
  }

  async tapNoThanksSecutityUpdates(): Promise<void> {
    await this.noThanksSecutityUpdates.tap();
  }
}
export default new BootstrapScreen();
