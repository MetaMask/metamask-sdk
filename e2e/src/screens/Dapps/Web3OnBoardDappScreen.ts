import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '../../Utils';
import { Dapp } from '../interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '../../Selectors';

class Web3OnBoardDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="connect"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "connect"'),
      }),
    );
  }

  get metaMaskConnectButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="MetaMask"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "MetaMask"'),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="disconnect"]',
        ),
        iosSelector: IOSSelector.by().iosClassChain(
          '**/XCUIElementTypeButton[`name == "Terminate"`]',
        ),
      }),
    );
  }

  get signButton(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="Test Sign"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "Test Sign"'),
      }),
    );
  }

  async connect(): Promise<void> {
    await (await this.connectButton).click();
  }

  async tapMetaMaskConnectButton(): Promise<void> {
    await (await this.metaMaskConnectButton).click();
  }

  async terminate(): Promise<void> {
    await (await this.terminateButton).click();
  }

  async sign(): Promise<void> {
    await (await this.signButton).click();
  }
}

const web3OnBoardDappScreen = new Web3OnBoardDappScreen();
export default web3OnBoardDappScreen;
