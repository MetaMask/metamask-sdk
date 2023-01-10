import { Image } from '../../atoms/Image';
import { Button } from '../../atoms/Button';

class GetStartedScreen {
  private get getStartedButton(): Button {
    return new Button({
      androidSelector: '~welcome-screen-get-started-button-id',
      iOSSelector: '~welcome-screen-get-started-button-id',
    });
  }

  private get MMFox(): Image {
    return new Image('splash-screen-metamask-animation-id');
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
}
export default new GetStartedScreen();
