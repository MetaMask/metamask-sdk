import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  DappMetadata,
  DisconnectOptions,
  ECIESProps,
  EventType,
  KeyInfo,
  RemoteCommunication,
  StorageManagerProps,
  WebRTCLib,
} from '@metamask/sdk-communication-layer';
import { ChannelConfig } from 'packages/sdk-communication-layer/src/types/ChannelConfig';
import { Platform } from '../Platform/Platfform';
import { PlatformType } from '../types/PlatformType';
import { SDKLoggingOptions } from '../types/SDKLoggingOptions';
import InstallModal from '../ui/InstallModal/installModal';
import sdkWebPendingModal from '../ui/InstallModal/pendinglModal-web';
import { Ethereum } from './Ethereum';
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
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  storage?: StorageManagerProps;
  autoConnect?: AutoConnectOptions;
  logging?: SDKLoggingOptions;
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

  private displayedModal?: { onClose: () => void };

  constructor({
    dappMetadata,
    webRTCLib,
    communicationLayerPreference,
    transports,
    enableDebug = false,
    timer,
    ecies,
    storage,
    communicationServerUrl,
    autoConnect,
    logging,
  }: RemoteConnectionProps) {
    this.dappMetadata = dappMetadata;
    this.transports = transports;
    this.enableDebug = enableDebug;
    this.developerMode = logging?.developerMode === true;
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
      communicationServerUrl,
      context: 'dapp',
      ecies,
      storage,
      autoConnect,
      logging,
    });

    this.connector.startAutoConnect().then((channelConfig?: ChannelConfig) => {
      if (channelConfig) {
        this.handleSecureReconnection({ channelConfig, deeplink: false });
      }
    });

    this.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
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

  /**
   * Called after a connection is re-established on an existing channel in order to prevent session hijacking.
   *
   * On trusted device (same device as metamask): launch deeplink to authorize the channel
   * On untrusted device (webapp): ask user to reconnect.
   */
  async handleSecureReconnection({
    channelConfig,
    deeplink,
  }: {
    channelConfig: ChannelConfig;
    deeplink?: boolean;
  }) {
    const platform = Platform.getInstance();
    const platformType = platform.getPlatformType();
    const trustedDevice = !(
      platformType === PlatformType.DesktopWeb ||
      (platformType === PlatformType.NonBrowser && !platform.isReactNative())
    );

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::handleSecureReconnection() trustedDevice=${trustedDevice}`,
        channelConfig,
      );
    }

    if (trustedDevice && deeplink) {
      const linkParams = `redirect=true&otp=${channelConfig.channelId}`;
      const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
      const link = `metamask://connect?${linkParams}`;

      Platform.getInstance().openDeeplink?.(universalLink, link, '_self');
    } else if (!trustedDevice) {
      this.displayedModal = sdkWebPendingModal();
      const provider = Ethereum.getProvider();

      provider.once('connect', async (connectInfo) => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::handleSecureReconnection()  connected`,
            connectInfo,
          );
        }

        // Always make sure to requestAccounts first, otherwise queries will fail.
        await provider.request({
          method: 'eth_requestAccounts',
          params: [],
        });
        this.displayedModal?.onClose();
      });
    }
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

      const platform = Platform.getInstance();
      const platformType = platform.getPlatformType();

      const showQRCode =
        platformType === PlatformType.DesktopWeb ||
        (platformType === PlatformType.NonBrowser && !platform.isReactNative());

      this.connector.once(EventType.CLIENTS_READY, () => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::startConnection::on 'clients_ready'`,
          );
        }
        this.displayedModal?.onClose();
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
          // Already connected through auto connect
          this.handleSecureReconnection({ channelConfig, deeplink: true });
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
                this.displayedModal = InstallModal({
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
    if (this.enableDebug) {
      console.debug(`RemoteConnection::disconnect()`, options);
    }
    this.connector.disconnect(options);
    const platform = Platform.getInstance();

    if (platform.isBrowser() || platform.isReactNative()) {
      const provider = Ethereum.getProvider();
      provider.handleDisconnect();
    }
  }
}
