import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/Utils';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class GetStartedScreen {
  get getStartedButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="welcome-screen-get-started-button-id"]',
        ),
        iosSelector: IOSSelector.by().predicateString('label == "Get started"'),
      }),
    );
  }

  async tapGetStarted(): Promise<void> {
    await this.getStartedButton.click();
  }
}

const getStartedScreen = new GetStartedScreen();
export default getStartedScreen;
