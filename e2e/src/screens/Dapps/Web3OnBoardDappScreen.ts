import { ChainablePromiseElement } from 'webdriverio';

import { getSelectorForPlatform } from '@util/Utils';
import { Dapp } from '@screens/interfaces/Dapp';
import { AndroidSelector, IOSSelector } from '@util/Selectors';

class Web3OnBoardDappScreen implements Dapp {
  get connectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="connect"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "connect"'),
      }),
    );
  }

  get metaMaskConnectButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="MetaMask"]',
        ),
        iosSelector: IOSSelector.by().predicateString('name == "MetaMask"'),
      }),
    );
  }

  get terminateButton(): ChainablePromiseElement {
    return $(
      getSelectorForPlatform({
        androidSelector: AndroidSelector.by().xpath(
          '//android.widget.Button[@text="disconnect"]',
        ),
        iosSelector: IOSSelector.by().classChain(
          '**/XCUIElementTypeButton[`name == "Terminate"`]',
        ),
      }),
    );
  }

  get signButton(): ChainablePromiseElement {
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
    await this.connectButton.waitForEnabled({
      timeout: 10000,
    });
    await this.connectButton.click();
  }

  async tapMetaMaskConnectButton(): Promise<void> {
    await this.metaMaskConnectButton.waitForEnabled({
      timeout: 10000,
    });
    await this.metaMaskConnectButton.click();
  }

  async terminate(): Promise<void> {
    await this.terminateButton.waitForEnabled({
      timeout: 10000,
    });
    await this.terminateButton.click();
  }

  async sign(): Promise<void> {
    await this.signButton.waitForEnabled({
      timeout: 10000,
    });
    await this.signButton.click();
  }

  async isDappConnected(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

const web3OnBoardDappScreen = new Web3OnBoardDappScreen();
export default web3OnBoardDappScreen;
