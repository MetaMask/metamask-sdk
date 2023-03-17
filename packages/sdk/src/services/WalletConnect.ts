import { ChannelConfig } from '@metamask/sdk-communication-layer';
import { Platform } from '../Platform/Platfform';
import { PlatformType } from '../types/PlatformType';
import InstallModal from '../ui/InstallModal/installModal';
import { ProviderService } from './ProviderService';

// TODO extract exact type from wallet connect library
interface WalletConnectInstance {
  connected: boolean;
  uri: string;
  createSession: () => Promise<void>;
  on: (event: string, cb: () => void) => void;
}

interface WalletConnectProps {
  // new WCInstance({ bridge: 'https://bridge.walletconnect.org'})
  wcConnector: WalletConnectInstance; // should provide an instance of wallet connect
  forceRestart?: boolean;
}

export class WalletConnect implements ProviderService {
  wcConnector: WalletConnectInstance;

  universalLink: string;

  deepLink: string;

  sentFirstConnect = false;

  forceRestart: boolean;

  constructor({ wcConnector, forceRestart = false }: WalletConnectProps) {
    this.wcConnector = wcConnector;
    this.forceRestart = forceRestart;

    const linkParams = `uri=${encodeURIComponent(this.wcConnector?.uri)}`;

    this.universalLink = `${'https://metamask.app.link/wc?'}${linkParams}`;
    this.deepLink = `metamask://wc?${linkParams}`;
  }

  getChannelConfig(): ChannelConfig | undefined {
    throw new Error('Method not implemented.');
  }

  getConnector() {
    // TODO find overlaps and return correct type
    // we should add depdency to wallet connect lib to get the types.
    return this.wcConnector;
  }

  getUniversalLink() {
    return this.universalLink;
  }

  startConnection() {
    return new Promise<boolean>((resolve, reject) => {
      if (this.wcConnector.connected) {
        resolve(true);
        return;
      }

      this.wcConnector
        .createSession()
        .then(() => {
          const platform = Platform.getInstance();
          const platformType = platform.getPlatformType();

          /* #if _REACTNATIVE
          const showQRCode = false
          //#else */
          const showQRCode =
            platformType === PlatformType.DesktopWeb ||
            platformType === PlatformType.NonBrowser;
          // #endif

          let installModal: any;
          if (showQRCode) {
            installModal = InstallModal({ link: this.universalLink });
            // console.log('OPEN LINK QR CODE', universalLink);
          } else {
            // console.log('OPEN LINK', universalLink);
            // window.location.assign(link);
            platform.openDeeplink(this.universalLink, this.deepLink, '_self');
          }

          this.wcConnector.on('connect', () => {
            if (
              installModal?.onClose &&
              typeof installModal.onClose === 'function'
            ) {
              installModal?.onClose();
            }

            if (this.sentFirstConnect) {
              return;
            }
            resolve(true);
            this.sentFirstConnect = true;
          });
        })
        .catch((error) => reject(error));
    });
  }

  isConnected() {
    return this.wcConnector.connected;
  }

  disconnect(): void {
    // nothing to do here.
  }
}
