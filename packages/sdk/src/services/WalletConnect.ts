import Platform, { PlatformName } from '../Platform';
import InstallModal from '../ui/InstallModal';

const WalletConnect = {
  WalletConnectInstance: null,
  connector: null,
  getConnector() {
    if (!this.connector) {
      const WCInstance = this.WalletConnectInstance;
      if(!WCInstance) throw new Error("WalletConnectInstance must be provided")
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
    return new Promise((resolve, reject) => {
      if (this.getConnector().connected) {
        return resolve(true);
      }

      this.getConnector()
        .createSession()
        .then(() => {
          let installModal = null

          const linkParams = `uri=${encodeURIComponent(
            this.getConnector().uri,
          )}`;

          const universalLink = `${'https://metamask.app.link/wc?'}${linkParams}`;

          const deeplink =`metamask://connect?${linkParams}`

          /*#if _REACTNATIVE
          const showQRCode = false
          //#else */
          const showQRCode = Platform.getPlatform() === PlatformName.DesktopWeb;;
          //#endif

          if (showQRCode) {
            installModal = InstallModal({ link: universalLink });
            console.log('OPEN LINK QR CODE', universalLink);
          } else {
            console.log('OPEN LINK', universalLink);
            // window.location.assign(link);
            Platform.openDeeplink(universalLink, deeplink, '_self');
          }

          this.getConnector().on('connect', () => {
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
