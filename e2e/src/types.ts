import { AndroidSelectorStrategies, IOSSelectorStrategies } from './Strategies';

export enum Dapps {
  UnityDapp = 'unity-dapp',
  ReactNativeDapp = 'react-native-dapp',
  CreateReactDapp = 'create-react-dapp',
  NextDapp = 'nextjs-dapp',
  IOSNativeDapp = 'ios-native-dapp',
}

export interface BrowserSize {
  width: number;
  height: number;
}

interface MetaMaskLocatorProps {
  locator: string;
  strategy: AndroidSelectorStrategies | IOSSelectorStrategies;
}

export interface Coordinates {
  x: number;
  y: number;
}

export type ScreenPercentage = Coordinates;

export interface MetaMaskElementLocator {
  androidLocator?: MetaMaskLocatorProps;
  iosLocator?: MetaMaskLocatorProps;
}

// Coordinates representing a certain Unity element on screen
export class UnityDappElement {
  xPercentage: number;

  yPercentage: number;

  constructor(coordinates: Coordinates) {
    this.xPercentage = coordinates.x;
    this.yPercentage = coordinates.y;
  }
}
