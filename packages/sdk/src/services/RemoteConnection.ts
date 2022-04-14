import Platform, { PlatformName } from '../Platform';
import RemoteCommunication from './RemoteCommunication';
import InstallModal from '../ui/InstallModal';
import Socket from './RemoteCommunication/Socket';
import WebRTC from './RemoteCommunication/WebRTC';
import PostMessageStreams from '../PostMessageStreams';
import { CommunicationLayerPreference } from '../constants';

const RemoteConnection = {
  RemoteCommunication: null,
  webRTCLib: null,
  getConnector() {
    if (!this.RemoteCommunication) {
      const CommLayer =
        PostMessageStreams.communicationLayerPreference ===
        CommunicationLayerPreference.WEBRTC
          ? WebRTC
          : Socket;
      this.RemoteCommunication = new RemoteCommunication({
        CommLayer,
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
    const { channelId, pubKey } = this.getConnector().generateChannelId();

    const link = `${'https://metamask.app.link/connect?channelId='}${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent(
      PostMessageStreams.communicationLayerPreference,
    )}&pubkey=${encodeURIComponent(pubKey)}`;

    const isDesktop = Platform.getPlatform() === PlatformName.DesktopWeb;

    if (isDesktop || Platform.showQRCode) {
      InstallModal({ link });
      console.log('OPEN LINK QRCODE', link);
    } else {
      console.log('OPEN LINK', link);
      Platform.openLink?.(link);
    }
    return new Promise((resolve) => {
      this.getConnector().once('clients_ready', () => {
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
