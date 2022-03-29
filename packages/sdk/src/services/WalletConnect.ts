import WC from '@walletconnect/client';
import InstallModal from '../ui/InstallModal';

const WalletConnect = {
  WalletConnectInstance: null,
  connector: null,
  getConnector() {
    if (!this.connector) {
      const WCInstance = this.WalletConnectInstance || WC;
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
  isDesktop: false,
  sentFirstConnect: false,
  openLink: null,
  startConnection() {
    return new Promise((resolve, reject) => {
      if (this.getConnector().connected) {
        return resolve(true);
      }

      this.getConnector()
        .createSession()
        .then(() => {
          const link = `${'https://metamask.app.link/wc?uri='}${encodeURIComponent(
            this.getConnector().uri,
          )}`;
          if (this.isDesktop) {
            InstallModal({ link });
          } else {
            console.log('OPEN LINK', link);
            // window.location.assign(link);
            if (this.openLink) {
              this.openLink(link);
            } else {
              window.open(link, '_self');
            }
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
