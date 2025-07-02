import { generateQRCode } from '../../utis';
import type { UIManager, UIModalController, ConnectionModalOptions, PlatformUIOptions } from './index';

export class ReactNativeUIManager implements UIManager {
  private options: PlatformUIOptions;
  private activeModal: ReactNativeModalController | null = null;

  constructor(options: PlatformUIOptions) {
    this.options = options;
  }

  async showConnectionModal(options: ConnectionModalOptions): Promise<UIModalController> {
    if (this.options.headless) {
      return new HeadlessModalController(options.link);
    }

    // Close existing modal
    if (this.activeModal) {
      this.activeModal.close();
    }

    const controller = new ReactNativeModalController({
      ...options,
      debug: this.options.debug,
      onClose: (shouldTerminate) => {
        this.activeModal = null;
        options.onClose?.(shouldTerminate);
      }
    });

    await controller.show();
    this.activeModal = controller;
    return controller;
  }

  isExtensionAvailable(): boolean {
    // No browser extension in React Native
    return false;
  }
}

class ReactNativeModalController implements UIModalController {
  private options: ConnectionModalOptions & { debug?: boolean };
  private visible = false;

  constructor(options: ConnectionModalOptions & { debug?: boolean }) {
    this.options = options;
  }

  async show() {
    this.visible = true;

    // In React Native, we can attempt to open the deeplink directly
    // or show a native modal with QR code (implementation depends on specific React Native setup)

    if (this.options.debug) {
      console.log('ReactNative: Showing connection modal with link:', this.options.link);
    }

    // Try to open MetaMask app directly
    const deeplinkUrl = this.options.link.replace('https://metamask.app/connect', 'metamask://connect');

    try {
      // This would require react-native-url-scheme or similar package
      // For now, we'll log the deeplink and QR code data
      console.log('MetaMask Deeplink:', deeplinkUrl);
      console.log('QR Code for manual scanning:', this.options.link);

      // In a real implementation, you'd use:
      // const { Linking } = require('react-native');
      // await Linking.openURL(deeplinkUrl);

      this.tryOpenDeeplink(deeplinkUrl);
    } catch (error) {
      console.error('Failed to open MetaMask app:', error);
      // Fallback to showing QR code data
      this.showQRCodeFallback();
    }
  }

  private tryOpenDeeplink(url: string) {
    try {
      // React Native deeplink opening
      if (typeof require !== 'undefined') {
        const Linking = require('react-native')?.Linking;
        if (Linking) {
          Linking.openURL(url).catch((err: any) => {
            console.error('Failed to open deeplink:', err);
            this.showQRCodeFallback();
          });
          return;
        }
      }

      // Fallback for environments without React Native Linking
      this.showQRCodeFallback();
    } catch (error) {
      console.error('Error accessing React Native Linking:', error);
      this.showQRCodeFallback();
    }
  }

  private showQRCodeFallback() {
    console.log('='.repeat(50));
    console.log('METAMASK CONNECTION');
    console.log('='.repeat(50));
    console.log('Scan this QR code with MetaMask Mobile:');
    console.log(this.options.link);
    console.log('');
    console.log('QR Code Data:');
    console.log(generateQRCode(this.options.link));
    console.log('='.repeat(50));
  }

  updateQRCode(link: string) {
    this.options.link = link;
    if (this.options.debug) {
      console.log('ReactNative: Updated QR code link:', link);
    }
  }

  close(shouldTerminate = false) {
    this.visible = false;
    this.options.onClose?.(shouldTerminate);
  }

  isVisible(): boolean {
    return this.visible;
  }
}

class HeadlessModalController implements UIModalController {
  private link: string;

  constructor(link: string) {
    this.link = link;
    console.log('MetaMask Connection QR Code:', link);
    console.log('QR Code Data:', generateQRCode(link));
  }

  updateQRCode(link: string) {
    this.link = link;
    console.log('Updated MetaMask Connection QR Code:', link);
  }

  close() {
    // Nothing to close in headless mode
  }

  isVisible(): boolean {
    return false;
  }
}
