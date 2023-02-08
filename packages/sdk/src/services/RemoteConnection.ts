import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  ConnectionStatus,
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

  async startConnection(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.enableDebug) {
        console.debug(`RemoteConnection::startConnection()`);
      }

      if (this.connector.isConnected()) {
        console.debug(`RemoteConnection::startConnection() Already connected.`);
        // Nothing to do, already connected.
        return false;
      }

      let installModal: any;
      const platform = Platform.getInstance();
      const platformType = platform.getPlatformType();

      const showQRCode =
        platformType === PlatformType.DesktopWeb ||
        (platformType === PlatformType.NonBrowser && !platform.isReactNative());

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

      // Check for existing channelConfig?
      this.connector.startAutoConnect().then((channelConfig) => {
        console.debug(
          `RemoteConnection::startConnection after startAutoConnect`,
          channelConfig,
        );

        if (channelConfig) {
          // Avoid generating extra channel information
          console.debug(`Already connected through autoConnect`);
          if (showQRCode) {
            // TODO handle web case to show a popup asking for reconnection
            console.info(`PLEASE Open Metamask to re-establish connection`);
          } else {
            const linkParams = `redirect=true&otp=${channelConfig.channelId}`;
            const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
            const deeplink = `metamask://connect?${linkParams}`;

            Platform.getInstance().openDeeplink?.(
              universalLink,
              deeplink,
              '_self',
            );
          }
        } else {
          // generate new channel id
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

              if (showQRCode) {
                installModal = InstallModal({
                  link: universalLink,
                  debug: this.enableDebug,
                });
                // console.log('OPEN LINK QRCODE', universalLink);
              } else {
                console.log('OPEN LINK', universalLink);
                Platform.getInstance().openDeeplink?.(
                  universalLink,
                  deeplink,
                  '_self',
                );
              }
              this.universalLink = universalLink;
            })
            .catch((err) => {
              console.debug(`RemoteConnection error`, err);
              reject(err);
            });
        }
      });

      // const status = this.connector.getConnectionStatus();
      // console.debug(`@############# status=${status} #################`);
      // if (status === ConnectionStatus.WAITING) {
      //   // Keep waiting until connection?
      //   if (this.enableDebug) {
      //     console.debug(
      //       `RemoteConnection::startConnection() connection waiting - prevent generating new channel`,
      //     );
      //   }
      //   const channelConfig = this.connector.getChannelConfig();

      //   // TODO start VALIDATION OTP PROCESS
      //   if (showQRCode) {
      //     console.warn(`TODO start validation`);
      //   } else {
      //     platform.openDeeplink(
      //       `https://metamask.app.link/connect?otp=${channelConfig?.channelId}`,
      //       `metamask://connect?otp=${channelConfig?.channelId}`,
      //       '_self',
      //     );
      //   }
      //   return false;
      // }

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
    const platform = Platform.getInstance();

    if (platform.isBrowser() || platform.isReactNative()) {
      const provider = Ethereum.getProvider();
      provider.handleDisconnect();
    }
  }
}
