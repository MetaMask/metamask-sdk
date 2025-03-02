import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

class ImportFromSeedScreen {
  private get srpField(): Input {
    return new Input({
      androidSelector: '~import-from-seed-screen-seed-phrase-input-id',
      iOSSelector: '~import-from-seed-screen-seed-phrase-input-id',
    });
  }

  private get firstPasswordInput(): Input {
    return new Input({
      androidSelector: `//android.widget.EditText[@text='New Password']`,
      iOSSelector: '**/XCUIElementTypeOther[`label == "New Password"`][6]',
    });
  }

  private get secondPasswordInput(): Input {
    return new Input({
      androidSelector: `//android.widget.EditText[@text='Confirm password']`,
      iOSSelector: '**/XCUIElementTypeOther[`label == "Confirm password"`][5]',
    });
  }

  private get importButton(): Button {
    return new Button({
      androidSelector: '~import-from-seed-screen-submit-button-id',
      iOSSelector: '~import-from-seed-screen-submit-button-id',
    });
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
}
export default ImportFromSeedScreen;
