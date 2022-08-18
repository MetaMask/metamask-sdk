import RemoteCommunication from '@metamask/sdk-communication-layer';
import Platform, { PlatformName } from '../Platform';
import InstallModal from '../ui/InstallModal';
import PostMessageStreams from '../PostMessageStreams';

const RemoteConnection = {
  RemoteCommunication: null,
  dappMetadata: null,
  transports: null,
  webRTCLib: null,
  timer: null,
  universalLink: null,
  getConnector() {
    if (!this.RemoteCommunication) {
      const commLayer = PostMessageStreams.communicationLayerPreference;

      let platform = 'undefined';
      /* #if _REACTNATIVE
        platform = 'react-native'
        //#elif _NODEJS
        platform = 'nodejs'
        //#else */
      if (Platform.getPlatform() === PlatformName.DesktopWeb) {
        platform = 'web-desktop';
      } else if (Platform.getPlatform() === PlatformName.MobileWeb) {
        platform = 'web-mobile';
      }
      // #endif

      this.RemoteCommunication = new RemoteCommunication({
        platform,
        commLayer,
        webRTCLib: this.webRTCLib,
        dappMetadata: this.dappMetadata,
        transports: this.transports,
      });

      this.RemoteCommunication.on('clients_disconnected', () => {
        this.sentFirstConnect = false;
      });

      if (this.timer) {
        this.timer.runBackgroundTimer?.(() => null, 5000);
      }
    }

    return this.RemoteCommunication;
  },
  forceRestart: false,
  isConnected() {
    return this.getConnector().connected;
  },
  sentFirstConnect: false,
  startConnection() {
    this.universalLink = null;
    let installModal = null;
    const { channelId, pubKey } = this.getConnector().generateChannelId();
    const linkParams = `channelId=${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent(
      PostMessageStreams.communicationLayerPreference,
    )}&pubkey=${encodeURIComponent(pubKey)}`;

    const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;

    const deeplink = `metamask://connect?${linkParams}`;

    /* #if _REACTNATIVE
    const showQRCode = false
    //#else */
    const showQRCode =
      Platform.getPlatform() === PlatformName.DesktopWeb ||
      Platform.getPlatform() === PlatformName.NonBrowser;
    // #endif

    if (showQRCode) {
      installModal = InstallModal({ link: universalLink });
      console.log('OPEN LINK QRCODE', universalLink);
    } else {
      console.log('OPEN LINK', universalLink);
      Platform.openDeeplink?.(universalLink, deeplink, '_self');
    }

    this.universalLink = universalLink;

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
  isPaused() {
    return this.RemoteCommunication.paused;
  },
};

export default RemoteConnection;
