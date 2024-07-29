import { Dapp } from './Dapp';

export type MobileBrowser = {
  goToAddress(address: string, pageObject: Dapp): Promise<void>;
  refreshPage(): Promise<void>;
};
