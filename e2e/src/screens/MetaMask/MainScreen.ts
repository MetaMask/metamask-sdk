import { ChainablePromiseElement } from 'webdriverio';
import { getSelectorForPlatform } from '@util/utils';
import { AndroidSelector, IOSSelector } from '@util/selectors';

class MainScreen {
  get networkSwitcher(): ChainablePromiseElement {
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
