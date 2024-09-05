import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '../../Utils';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class MainScreen {
  get networkSwitcher(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//*[@resource-id="open-networks-button"]',
        ),
        iosSelector: IOSSelector.by().predicateString(
          'name == "open-networks-button"',
        ),
      }),
    );
  }
}

const mainScreen = new MainScreen();
export default mainScreen;
