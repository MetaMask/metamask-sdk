import WC from '@walletconnect/client';

const connector = new WC({
  bridge: 'https://bridge.walletconnect.org', // Required
});

const WalletConnect = {
  connector,
  forceRestart: false,
  isConnected() {
    return connector.connected;
  },
  sentFirstConnect: false,
  startConnection() {
    return new Promise((resolve, reject) => {
      if (connector.connected) {
        return resolve(true);
      }

      connector
        .createSession()
        .then(() => {
          const link = `${'https://metamask.app.link/wc?uri='}${encodeURIComponent(
            connector.uri,
          )}`;
          // window.location.assign(link);
          window.open(link, '_self');

          WalletConnect.connector.on('connect', () => {
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
