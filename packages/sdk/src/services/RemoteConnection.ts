import Platform, { PlatformName } from '../Platform';
import RemoteCommunication from '@metamask/sdk-communication-layer';
import InstallModal from '../ui/InstallModal';
import PostMessageStreams from '../PostMessageStreams';

const RemoteConnection = {
  RemoteCommunication: null,
  webRTCLib: null,
  getConnector() {
    if (!this.RemoteCommunication) {
      const commLayer =
        PostMessageStreams.communicationLayerPreference
      this.RemoteCommunication = new RemoteCommunication({
        commLayer,
        webRTCLib: this.webRTCLib,
      });
      this.RemoteCommunication.on('clients_disconnected', () => {
        this.sentFirstConnect = false;
      });
    }

    return this.RemoteCommunication;
  },
  forceRestart: false,
  isConnected() {
    return this.getConnector().connected;
  },
  sentFirstConnect: false,
  startConnection() {
    let installModal = null
    const { channelId, pubKey } = this.getConnector().generateChannelId();
    const linkParams = `channelId=${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent(
      PostMessageStreams.communicationLayerPreference,
    )}&pubkey=${encodeURIComponent(pubKey)}`
    
    const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;

    const deeplink =`metamask://connect?${linkParams}`

    /*#if _REACTNATIVE
    const showQRCode = false
    //#else */
    const showQRCode = Platform.getPlatform() === PlatformName.DesktopWeb;;
    //#endif

    if (showQRCode) {
      installModal = InstallModal({ link: universalLink });
      console.log('OPEN LINK QRCODE', universalLink);
    } else {
      console.log('OPEN LINK', universalLink);
      Platform.openDeeplink?.(universalLink, deeplink, '_self');
    }
    return new Promise((resolve) => {
      this.getConnector().once('clients_ready', () => {
        installModal?.onClose();
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
