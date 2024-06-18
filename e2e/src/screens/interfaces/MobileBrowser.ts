export type MobileBrowser = {
  goToAddress(address: string): Promise<void>;
  refreshPage(): Promise<void>;
};
