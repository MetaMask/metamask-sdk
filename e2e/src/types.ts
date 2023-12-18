export type BrowserSize = {
  width: number;
  height: number;
};

export type MetaMaskElementSelector = {
  androidSelector?: string;
  iosSelector?: string;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type ScreenPercentage = Coordinates;

// Coordinates representing a certain Unity element on screen
export class UnityDappElement {
  xPercentage: number;

  yPercentage: number;

  constructor(coordinates: Coordinates) {
    this.xPercentage = coordinates.x;
    this.yPercentage = coordinates.y;
  }
}
