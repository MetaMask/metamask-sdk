import { generateQRCode } from '../../utis';
import type { UIManager, UIModalController, ConnectionModalOptions, PlatformUIOptions } from './index';

export class NodeUIManager implements UIManager {
  private options: PlatformUIOptions;

  constructor(options: PlatformUIOptions) {
    this.options = options;
  }

  async showConnectionModal(options: ConnectionModalOptions): Promise<UIModalController> {
    // Node.js is always headless, show console-based QR code
    return new NodeModalController({
      ...options,
      debug: this.options.debug
    });
  }

  isExtensionAvailable(): boolean {
    // No browser extension in Node.js
    return false;
  }
}

class NodeModalController implements UIModalController {
  private options: ConnectionModalOptions & { debug?: boolean };
  private visible = false;

  constructor(options: ConnectionModalOptions & { debug?: boolean }) {
    this.options = options;
    this.show();
  }

  private show() {
    this.visible = true;

    console.log('\n' + '='.repeat(60));
    console.log('               METAMASK CONNECTION');
    console.log('='.repeat(60));
    console.log('');
    console.log('🔗 Connection Link:');
    console.log(this.options.link);
    console.log('');
    console.log('📱 Scan this QR code with MetaMask Mobile:');
    console.log('');

    // Generate and display QR code
    const qrCode = generateQRCode(this.options.link);
    if (qrCode) {
      // For Node.js, we could use a library like 'qrcode-terminal' for ASCII QR codes
      // For now, we'll just show the SVG data which can be saved to a file
      console.log('QR Code SVG (save to file and open in browser):');
      console.log(qrCode);
    } else {
      console.log('Failed to generate QR code. Use the connection link above.');
    }

    console.log('');
    console.log('💡 Instructions:');
    console.log('   1. Open MetaMask Mobile app');
    console.log('   2. Tap the scan QR code button');
    console.log('   3. Scan the QR code above');
    console.log('   4. Approve the connection in MetaMask');
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    if (this.options.debug) {
      console.log('Debug Info:');
      console.log('- Platform: Node.js');
      console.log('- Dapp:', this.options.dapp.name || this.options.dapp.url);
      console.log('- SDK Version:', this.options.sdkVersion);
      console.log('');
    }
  }

  updateQRCode(link: string) {
    this.options.link = link;
    console.log('\n🔄 Connection link updated:', link);

    const qrCode = generateQRCode(link);
    if (qrCode) {
      console.log('Updated QR Code SVG:');
      console.log(qrCode);
    }
  }

  close(shouldTerminate = false) {
    this.visible = false;
    console.log('\n❌ Connection modal closed');
    if (shouldTerminate) {
      console.log('🔌 Connection terminated by user');
    }
    this.options.onClose?.(shouldTerminate);
  }

  isVisible(): boolean {
    return this.visible;
  }
}
