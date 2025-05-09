import { Dapp } from '@screens/interfaces/Dapp';

export type MobileBrowser = {
  goToAddress(address: string, pageObject: Dapp): Promise<void>;
  refreshPage(): Promise<void>;
  launchBrowser(): Promise<void>;
};
