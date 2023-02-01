import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  DappMetadata,
  DisconnectOptions,
  ECIESProps,
  KeyInfo,
  MessageType,
  RemoteCommunication,
  StorageManagerProps,
  WebRTCLib,
} from '@metamask/sdk-communication-layer';
import { ChannelConfig } from 'packages/sdk-communication-layer/src/types/ChannelConfig';
import { BooleanLiteral } from 'typescript';
import { ErrorMessages } from '../constants';
import { Platform } from '../Platform/Platfform';
import { PlatformType } from '../types/PlatformType';
import InstallModal from '../ui/InstallModal/installModal';
import { Ethereum } from './Ethereum';
import { ProviderService } from './ProviderService';

interface RemoteConnectionProps {
  timer?: {
    runBackgroundTimer?: (cb: () => void, ms: number) => number;
  };
  communicationLayerPreference: CommunicationLayerPreference;
  dappMetadata?: DappMetadata;
  enableDebug?: boolean;
  developerMode: boolean;
  transports?: string[];
  webRTCLib?: WebRTCLib;
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  storage?: StorageManagerProps;
  autoConnect?: AutoConnectOptions;
}
export class RemoteConnection implements ProviderService {
  private connector: RemoteCommunication;

  private dappMetadata?: DappMetadata;

  private transports?: string[];

  private webRTCLib?: WebRTCLib;

  private universalLink?: string;

  private enableDebug: boolean;

  private developerMode: boolean;

  private forceRestart = false;

  private sentFirstConnect = false;

  private communicationLayerPreference: CommunicationLayerPreference;

  constructor({
    dappMetadata,
    webRTCLib,
    communicationLayerPreference,
    transports,
    enableDebug = false,
    timer,
    ecies,
    storage,
    developerMode = false,
    communicationServerUrl,
    autoConnect,
  }: RemoteConnectionProps) {
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.enableDebug = enableDebug;
    this.developerMode = developerMode;
    this.communicationLayerPreference = communicationLayerPreference;
    this.webRTCLib = webRTCLib;

    const platform = Platform.getInstance();

    this.connector = new RemoteCommunication({
      platform: platform.getPlatformType(),
      communicationLayerPreference,
      transports: this.transports,
      webRTCLib: this.webRTCLib,
      dappMetadata: this.dappMetadata,
      analytics: this.enableDebug,
      developerMode: this.developerMode,
      communicationServerUrl,
      context: 'dapp',
      ecies,
      storage,
      autoConnect,
    });

    this.connector.startAutoConnect();
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

  startConnection(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.enableDebug) {
        console.debug(`RemoteConnection::startConnection()`);
      }

      if (this.connector.isConnected()) {
        console.debug(`RemoteConnection::startConnection() Already connected.`);
        // Nothing to do, already connected.
        return resolve(true);
      }

      this.connector
        .generateChannelId()
        .then(({ channelId, pubKey }) => {
          const linkParams = `channelId=${encodeURIComponent(
            channelId,
          )}&comm=${encodeURIComponent(
            this.communicationLayerPreference,
          )}&pubkey=${encodeURIComponent(pubKey)}`;

          const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
          const deeplink = `metamask://connect?${linkParams}`;

          const platform = Platform.getInstance();
          const platformType = platform.getPlatformType();

          const showQRCode =
            platformType === PlatformType.DesktopWeb ||
            (platformType === PlatformType.NonBrowser &&
              !platform.isReactNative());

          let installModal: any;

          if (showQRCode) {
            installModal = InstallModal({
              link: universalLink,
              debug: this.enableDebug,
            });
            // console.log('OPEN LINK QRCODE', universalLink);
          } else {
            // console.log('OPEN LINK', universalLink);
            Platform.getInstance().openDeeplink?.(
              universalLink,
              deeplink,
              '_self',
            );
          }

          this.universalLink = universalLink;

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
            this.sentFirstConnect = true;

            resolve(true);
          });
        })
        .catch((err) => {
          console.debug(`RemoteConnection error`, err);
          reject(err);
        });
      return true;
    });
  }

  getChannelConfig(): ChannelConfig | undefined {
    return this.connector.getChannelConfig();
  }

  getKeyInfo(): KeyInfo | undefined {
    return this.connector.getKeyInfo();
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

  disconnect(options?: DisconnectOptions): void {
    this.connector.disconnect(options);

    if (Platform.getInstance().isBrowser()) {
      const provider = Ethereum.getProvider();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      provider._state.isConnected = false;
      provider.emit('disconnect', ErrorMessages.MANUAL_DISCONNECT);
    }
  }
}
