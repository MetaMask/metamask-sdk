import {
  CommunicationLayerPreference,
  DappMetadata,
  MessageType,
  RemoteCommunication,
  WebRTCLib,
} from '@metamask/sdk-communication-layer';
import { Platform } from '../Platform/Platfform';
import { PlatformType } from '../types/PlatformType';
import InstallModal from '../ui/InstallModal/installModal';
import { ProviderService } from './ProviderService';

interface RemoteConnectionProps {
  timer?: {
    runBackgroundTimer?: (cb: () => void, ms: number) => number;
  };
  communicationLayerPreference: CommunicationLayerPreference;
  dappMetadata?: DappMetadata;
  enableDebug?: boolean;
  transports?: string[];
  webRTCLib?: WebRTCLib;
}
export class RemoteConnection implements ProviderService {
  connector: RemoteCommunication;

  dappMetadata?: DappMetadata;

  transports?: string[];

  webRTCLib?: WebRTCLib;

  universalLink?: string;

  enableDebug: boolean;

  forceRestart = false;

  sentFirstConnect = false;

  communicationLayerPreference: CommunicationLayerPreference;

  constructor({
    dappMetadata,
    webRTCLib,
    communicationLayerPreference,
    transports,
    enableDebug = false,
    timer,
  }: RemoteConnectionProps) {
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.enableDebug = enableDebug;
    this.communicationLayerPreference = communicationLayerPreference;
    this.webRTCLib = webRTCLib;

    const platform = Platform.getInstance();

    // FIXME make sure that still works
    this.connector = new RemoteCommunication({
      platform: platform.getPlatformType(),
      communicationLayerPreference,
      transports: this.transports,
      webRTCLib: this.webRTCLib,
      dappMetadata: this.dappMetadata,
      enableDebug: this.enableDebug,
      context: 'initiator',
    });

    this.connector.on(MessageType.CLIENTS_DISCONNECTED, () => {
      this.sentFirstConnect = false;
    });

    if (timer) {
      timer.runBackgroundTimer?.(() => null, 5000);
    }
  }

  getUniversalLink() {
    if (!this.universalLink) {
      throw new Error('connection not started. run startConnection() first.');
    }
    return this.universalLink;
  }

  startConnection() {
    const { channelId, pubKey } = this.connector.generateChannelId();
    const linkParams = `channelId=${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent(
      this.communicationLayerPreference,
    )}&pubkey=${encodeURIComponent(pubKey)}`;

    const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
    const deeplink = `metamask://connect?${linkParams}`;

    const platformType = Platform.getInstance().getPlatformType();

    /* #if _REACTNATIVE
    const showQRCode = false
    //#else */
    const showQRCode =
      platformType === PlatformType.DesktopWeb ||
      platformType === PlatformType.NonBrowser;
    // #endif

    let installModal: any;

    if (showQRCode) {
      installModal = InstallModal({ link: universalLink });
      // console.log('OPEN LINK QRCODE', universalLink);
    } else {
      // console.log('OPEN LINK', universalLink);
      Platform.getInstance().openDeeplink?.(universalLink, deeplink, '_self');
    }

    this.universalLink = universalLink;

    return new Promise<boolean>((resolve) => {
      this.connector.once(MessageType.CLIENTS_READY, () => {
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
    });
  }

  getConnector() {
    return this.connector;
  }

  isConnected() {
    return this.connector.isConnected();
  }

  isPaused() {
    return this.connector.isPaused();
  }
}
