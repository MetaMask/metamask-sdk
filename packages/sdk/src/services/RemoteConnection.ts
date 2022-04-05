import Platform, { PlatformName } from '../Platform';
import RemoteCommunication from './RemoteCommunication';
import InstallModal from '../ui/InstallModal';

const RemoteConnection = {
  RemoteCommunication: null,
  getConnector() {
    if (!this.RemoteCommunication) {
      this.RemoteCommunication = new RemoteCommunication({});
    }

    return this.RemoteCommunication;
  },
  forceRestart: false,
  isConnected() {
    return this.getConnector().connected;
  },
  sentFirstConnect: false,
  startConnection() {
    const id = this.getConnector().generateChannelId();

    const link = `${'https://metamask.app.link/connect?uri='}${encodeURIComponent(
      id,
    )}`;

    const isDesktop = Platform.getPlatform() === PlatformName.DesktopWeb

    if (isDesktop) {
      InstallModal({ link });
      console.log('OPEN LINK', link);
    } else {
      console.log('OPEN LINK', link);
      Platform.openLink(link)
    }
    return new Promise((resolve) => {
      this.getConnector().on('clients_ready', () => {
        console.log("clients_ready")
        if (this.sentFirstConnect) {
          return;
        }
        resolve(true);
        this.sentFirstConnect = true;
      });
    });
  },
};

export default RemoteConnection;
