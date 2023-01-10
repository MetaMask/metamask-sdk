import { Button } from '../../atoms/Button';

class WalletSetupScreen {
  private get importWithSRP(): Button {
    return new Button({
      androidSelector: '~wallet-setup-screen-import-from-seed-button-id',
      iOSSelector: '~wallet-setup-screen-import-from-seed-button-id',
    });
  }

  async tapImportWithSRP(): Promise<void> {
    await this.importWithSRP.tap();
  }
}
export default new WalletSetupScreen();
