import type { DappSettings } from '../multichain';

export interface ConnectionModalOptions {
  link: string;
  preferDesktop?: boolean;
  sdkVersion?: string;
  dapp: DappSettings;
  onClose?: (shouldTerminate?: boolean) => void;
  onConnect?: () => void;
  onInstall?: () => void;
}

export interface UIManager {
  /**
   * Show the install/connection modal
   */
  showConnectionModal(options: ConnectionModalOptions): Promise<UIModalController>;

  /**
   * Check if MetaMask extension is available
   */
  isExtensionAvailable(): boolean;

  /**
   * Open extension directly if available
   */
  connectWithExtension?(): Promise<void>;
}

export interface UIModalController {
  /**
   * Update the QR code link
   */
  updateQRCode?(link: string): void;

  /**
   * Close the modal
   */
  close(shouldTerminate?: boolean): void;

  /**
   * Check if modal is currently showing
   */
  isVisible(): boolean;
}

export type PlatformUIOptions = {
  headless: boolean;
  preferDesktop?: boolean;
  debug?: boolean;
};
