import { Button } from '../../atoms/Button';

class SecurityUpdatesScreen {
  private get noThanksSecutityUpdates(): Button {
    return new Button({
      androidSelector: `//*[@text='No thanks']`,
      iOSSelector: '**/XCUIElementTypeOther[`label == "No thanks"`]',
    });
  }

  async tapNoThanksSecutityUpdates(): Promise<void> {
    await this.noThanksSecutityUpdates.tap();
  }
}
export default new SecurityUpdatesScreen();
