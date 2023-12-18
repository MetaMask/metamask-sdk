import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';


class GetStartedScreen {
  get getStartedButton(): ChainablePromiseElement<WebdriverIO.Element> {
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
    await (await this.getStartedButton).click();
  }
}

const getStartedScreen = new GetStartedScreen();
export default getStartedScreen;
