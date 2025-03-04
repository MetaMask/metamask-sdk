import { Button } from '../../atoms/Button';

class CreateReactDappScreen {
  private get connectButton(): Button {
    return new Button({
      androidSelector: `//android.widget.Button[@text='Connect']`,
      iOSSelector: '**/XCUIElementTypeButton[`label == "Connect"`]',
    });
  }

  private get signButton(): Button {
    return new Button({
      androidSelector: `//android.widget.Button[@text='Sign']`,
      iOSSelector: '**/XCUIElementTypeButton[`label == "Sign"`]',
    });
  }

  private get sendTransactionButton(): Button {
    return new Button({
      androidSelector: `//android.widget.Button[@text='Send transaction']`,
      iOSSelector: '**/XCUIElementTypeButton[`label == "Send transaction"`]',
    });
  }

  private get addEthereumChainButton(): Button {
    return new Button({
      androidSelector: `//android.widget.Button[@text='Add ethereum chain']`,
      iOSSelector: '**/XCUIElementTypeButton[`label == "Add ethereum chain"`]',
    });
  }

  async tapConnect(): Promise<void> {
    await this.connectButton.tap();
  }

  async isDappConnectButtonClickable(): Promise<boolean> {
    return await this.connectButton.isClickable();
  }
}

export default CreateReactDappScreen;
