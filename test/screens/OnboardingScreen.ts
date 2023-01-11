import { Checkbox } from '../atoms/Checkbox';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

class WelcomeToMetaMaskScreen {
  private get getStartedButton(): Button {
    return new Button('~welcome-screen-get-started-button-id');
  }

  private get getCreateWallet(): Button {
    return new Button('~wallet-setup-screen-create-new-wallet-button-id');
  }

  private get noThanksButton(): Button {
    return new Button('~optin-metrics-no-thanks-button-id');
  }

  private get firstPasswordInput(): Input {
    return new Input('~create-password-first-input-field');
  }

  private get secondPasswordInput(): Input {
    return new Input('~create-password-second-input-field');
  }

  private get checkboxConfirmation(): Checkbox {
    return new Checkbox('~password-understand-box');
  }

  private get createPasswordButton(): Button {
    return new Button('~submit-button');
  }

  private get remindMeLaterButton(): Button {
    return new Button('~remind-me-later-button');
  }

  private get confirmSkipSecurityCheckbox(): Checkbox {
    return new Checkbox('~skip-backup-text');
  }

  private get skipConfirmationButton(): Button {
    return new Button('~Skip-button');
  }

  async fillPassword(password = 'asdasdasd'): Promise<void> {
    await this.firstPasswordInput.setValue(password);
    await this.secondPasswordInput.setValue(password);
  }

  async tapGetStarted(): Promise<void> {
    await this.getStartedButton.tap();
  }

  async tapCreateWallet(): Promise<void> {
    await this.getCreateWallet.tap();
  }

  async tapNoThanksButton(): Promise<void> {
    await this.noThanksButton.tap();
  }

  async tapCheckboxConfirmation(): Promise<void> {
    await this.checkboxConfirmation.tap();
  }

  async tapCreatePasswordButton(): Promise<void> {
    await this.createPasswordButton.tap();
  }

  async tapRemindMeLater(): Promise<void> {
    await this.remindMeLaterButton.tap();
  }

  async tapConfirmSkipAccountSecurityCheckbox(): Promise<void> {
    await this.confirmSkipSecurityCheckbox.tap();
  }

  async tapSkipConfirmationButton(): Promise<void> {
    await this.skipConfirmationButton.tap();
  }
}

export default WelcomeToMetaMaskScreen;
