import Platform, { PlatformName } from '../Platform';
import InstallModal from '../ui/InstallModal';

const WalletConnect = {
  WalletConnectInstance: null,
  connector: null,
  universalLink: null,
  getConnector() {
    if (!this.connector) {
      const WCInstance = this.WalletConnectInstance;
      if (!WCInstance) {
        throw new Error('WalletConnectInstance must be provided');
      }

      this.connector = new WCInstance({
        bridge: 'https://bridge.walletconnect.org', // Required
      });
    }

    return this.connector;
  },
  forceRestart: false,
  isConnected() {
    return this.getConnector().connected;
  },
  sentFirstConnect: false,
  startConnection() {
    this.universalLink = null;
    return new Promise((resolve, reject) => {
      if (this.getConnector().connected) {
        resolve(true);
        return;
      }

      this.getConnector()
        .createSession()
        .then(() => {
          let installModal = null;

          const linkParams = `uri=${encodeURIComponent(
            this.getConnector().uri,
          )}`;

          const universalLink = `${'https://metamask.app.link/wc?'}${linkParams}`;

          const deeplink = `metamask://wc?${linkParams}`;

          /* #if _REACTNATIVE
          const showQRCode = false
          //#else */
          const showQRCode =
            Platform.getPlatform() === PlatformName.DesktopWeb ||
            Platform.getPlatform() === PlatformName.NonBrowser;
          // #endif

          if (showQRCode) {
            installModal = InstallModal({ link: universalLink });
            console.log('OPEN LINK QR CODE', universalLink);
          } else {
            console.log('OPEN LINK', universalLink);
            // window.location.assign(link);
            Platform.openDeeplink(universalLink, deeplink, '_self');
          }

          this.universalLink = universalLink;

          this.getConnector().on('connect', () => {
            installModal?.onClose();
            if (this.sentFirstConnect) {
              return;
            }
            resolve(true);
            this.sentFirstConnect = true;
          });
        })
        .catch((error) => reject(error));
    });
  },
};

export default WalletConnect;
