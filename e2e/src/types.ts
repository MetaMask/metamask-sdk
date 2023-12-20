export type BrowserSize = {
  width: number;
  height: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type ScreenPercentage = Coordinates;

export type MetaMaskElementSelector = {
  androidSelector?: string;
  iosSelector?: string;
};

// Coordinates representing a certain Unity element on screen
export class UnityDappElement {
  xPercentage: number;

  yPercentage: number;

  constructor(coordinates: Coordinates) {
    this.xPercentage = coordinates.x;
    this.yPercentage = coordinates.y;
  }
}
