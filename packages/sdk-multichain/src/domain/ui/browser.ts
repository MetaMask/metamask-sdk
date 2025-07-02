import { generateQRCode } from '../../utis';
import type { UIManager, UIModalController, ConnectionModalOptions, PlatformUIOptions } from './index';

export class BrowserUIManager implements UIManager {
  private options: PlatformUIOptions;
  private loadedComponents = false;
  private activeModal: BrowserModalController | null = null;

  constructor(options: PlatformUIOptions) {
    this.options = options;
  }

  private async loadUIComponents() {
    if (this.loadedComponents) {
      return;
    }

    try {
      const loader = await import(
        /* webpackChunkName: "sdk-install-modal" */
        '@metamask/multichain-sdk-ui/loader'
      );
      loader.defineCustomElements();
      this.loadedComponents = true;
    } catch (error) {
      console.error('Failed to load UI components:', error);
      throw new Error('Failed to load UI components');
    }
  }

  async showConnectionModal(options: ConnectionModalOptions): Promise<UIModalController> {
    if (this.options.headless) {
      return new HeadlessModalController(options.link);
    }

    // Close existing modal
    if (this.activeModal) {
      this.activeModal.close();
    }

    await this.loadUIComponents();

    const controller = new BrowserModalController({
      ...options,
      debug: this.options.debug,
      preferDesktop: this.options.preferDesktop ?? options.preferDesktop,
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
    return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
  }

  async connectWithExtension(): Promise<void> {
    if (!this.isExtensionAvailable()) {
      throw new Error('MetaMask extension not available');
    }

    try {
      await window.ethereum?.request?.({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('Failed to connect with extension:', error);
      throw error;
    }
  }
}

class BrowserModalController implements UIModalController {
  private options: ConnectionModalOptions & { debug?: boolean };
  private modalElement: HTMLElement | null = null;
  private visible = false;

  constructor(options: ConnectionModalOptions & { debug?: boolean }) {
    this.options = options;
  }

  async show() {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.zIndex = '999999';

    document.body.appendChild(div);
    this.modalElement = div;

    const extensionAvailable = Boolean(window.ethereum?.isMetaMask);

    if (extensionAvailable) {
      // Show selection modal (extension vs mobile)
      const selectModal = document.createElement('mm-select-modal') as any;
      selectModal.link = this.options.link;
      selectModal.sdkVersion = this.options.sdkVersion;
      selectModal.preferDesktop = this.options.preferDesktop ?? true;

      selectModal.addEventListener('close', ({ detail: { shouldTerminate } }: any) => {
        this.close(shouldTerminate);
      });

      selectModal.addEventListener('connectWithExtension', async () => {
        try {
          await window.ethereum?.request?.({ method: 'eth_requestAccounts' });
          this.options.onConnect?.();
          this.close();
        } catch (error) {
          console.error('Failed to connect with extension:', error);
        }
      });

      div.appendChild(selectModal);
    } else {
      // Show install modal
      const installModal = document.createElement('mm-install-modal') as any;
      installModal.link = this.options.link;
      installModal.preferDesktop = this.options.preferDesktop ?? false;
      installModal.sdkVersion = this.options.sdkVersion;

      installModal.addEventListener('close', ({ detail: { shouldTerminate } }: any) => {
        this.close(shouldTerminate);
      });

      installModal.addEventListener('startDesktopOnboarding', () => {
        this.options.onInstall?.();
        // Open MetaMask extension installation page
        window.open('https://metamask.io/download/', '_blank');
      });

      div.appendChild(installModal);
    }

    this.visible = true;
  }

  updateQRCode(link: string) {
    if (!this.modalElement) return;

    const installModal = this.modalElement.querySelector('mm-install-modal') as any;
    const selectModal = this.modalElement.querySelector('mm-select-modal') as any;

    if (installModal) {
      installModal.link = link;
    }
    if (selectModal) {
      selectModal.link = link;
    }
  }

  close(shouldTerminate = false) {
    if (this.modalElement?.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
    this.modalElement = null;
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
    // In headless mode, just emit the display_uri event or log the QR link
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
    return false; // Headless mode doesn't have visible UI
  }
}
