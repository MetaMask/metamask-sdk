import {
  AutoConnectOptions,
  CommunicationLayerPreference,
  ConnectionStatus,
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
import sdkPendingModal from '../ui/InstallModal/pendingModal';
import { Ethereum } from './Ethereum';
import { ProviderService } from './ProviderService';

interface RemoteConnectionProps {
  timer?: {
    runBackgroundTimer?: (cb: () => void, ms: number) => number;
    stopBackgroundTimer?: () => void;
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
  modals: {
    onPendingModalDisconnect?: () => void;
  };
}
export class RemoteConnection implements ProviderService {
  private connector: RemoteCommunication;

  private universalLink?: string;

  private developerMode: boolean;

  private sentFirstConnect = false;

  private communicationLayerPreference: CommunicationLayerPreference;

  private displayedModal?: {
    onClose: () => void;
    updateOTPValue?: (otpAnswer: number) => void;
  };

  private options: RemoteConnectionProps;

  /**
   * Wait for value from metamask mobile
   */
  private otpAnswer?: number;

  constructor(options: RemoteConnectionProps) {
    this.options = options;
    const developerMode = options.logging?.developerMode === true;
    this.developerMode = developerMode;
    this.communicationLayerPreference = options.communicationLayerPreference;
    this.connector = this.initializeConnector();
  }

  initializeConnector() {
    const {
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
    } = this.options;

    this.sentFirstConnect = false;

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::initializeConnector() re-intialize connector`,
      );
    }

    // Cleanup previous handles
    if (this.connector) {
      if (timer?.stopBackgroundTimer) {
        timer.stopBackgroundTimer();
      }
      // this.connector.removeAllListeners();
    }

    const platform = Platform.getInstance();

    this.connector = new RemoteCommunication({
      platform: platform.getPlatformType(),
      communicationLayerPreference,
      transports,
      webRTCLib,
      dappMetadata,
      analytics: enableDebug,
      communicationServerUrl,
      context: 'dapp',
      ecies,
      storage,
      autoConnect,
      logging,
    });

    if (autoConnect?.enable === true) {
      console.debug(
        `RemoteConnection::initializeConnector() autoconnect=${autoConnect}`,
      );

      this.connector
        .startAutoConnect()
        .then((channelConfig?: ChannelConfig) => {
          if (channelConfig?.lastActive) {
            this.handleSecureReconnection({ channelConfig, deeplink: false });
          }
        });
    }

    if (timer) {
      timer.runBackgroundTimer?.(() => null, 5000);
    }

    this.connector.on(EventType.OTP, (otpAnswer) => {
      console.debug(`RECEIVED EVENT OTP`, otpAnswer);
      this.otpAnswer = otpAnswer;
    });

    this.connector.on(EventType.CONNECTION_STATUS, (status) => {
      if (status === ConnectionStatus.TERMINATED) {
        this.displayedModal?.onClose();
      } else if (status === ConnectionStatus.DISCONNECTED) {
        this.sentFirstConnect = false;
      }
    });

    return this.connector;
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
   * On trusted device (same device as metamask):
   *   - launch deeplink to authorize the channel
   *
   * On untrusted device (webapp):
   *  - ask user to reconnect.
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
    const provider = Ethereum.getProvider();

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::handleSecureReconnection() trustedDevice=${trustedDevice} deepLink=${deeplink} providerConnected=${provider.isConnected()}`,
        channelConfig,
      );
    }

    if (trustedDevice && deeplink) {
      const pubKey = this.connector?.getKeyInfo()?.ecies.public ?? '';
      let linkParams = encodeURI(
        `channelId=${channelConfig.channelId}&comm=${this.communicationLayerPreference}&pubkey=${pubKey}`,
      );

      if (provider.isConnected()) {
        linkParams += `&redirect=true`;
      }

      const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
      const link = `metamask://connect?${linkParams}`;

      Platform.getInstance().openDeeplink?.(universalLink, link, '_self');
    } else if (!trustedDevice) {
      const onDisconnect = () => {
        this.options.modals.onPendingModalDisconnect?.();
        this.displayedModal?.onClose();
      };

      const waitForOTP = async (): Promise<number> => {
        let checkOTPTrial = 0;
        while (checkOTPTrial < 100) {
          if (this.otpAnswer) {
            return this.otpAnswer;
          }
          await new Promise<void>((res) => setTimeout(() => res(), 1000));
          checkOTPTrial += 1;
        }
        return -1;
      };

      this.displayedModal = sdkPendingModal(onDisconnect);
      waitForOTP().then((otpAnswer) => {
        this.displayedModal?.updateOTPValue?.(otpAnswer);
      });

      provider.once('connect', async (connectInfo) => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::handleSecureReconnection()  connected provider.selectedAddress=${provider.selectedAddress}`,
            connectInfo,
          );
        }

        try {
          // Always make sure to requestAccounts first, otherwise queries will fail.
          await provider.request({
            method: 'eth_requestAccounts',
            params: [],
          });
        } catch (err) {
          console.warn(`an error occured`, err);
        } finally {
          this.displayedModal?.onClose();
        }
      });
    }
  }

  async startConnection(): Promise<boolean> {
    // eslint-disable-next-line consistent-return
    return new Promise<boolean>((resolve, reject) => {
      if (!this.connector) {
        return reject(new Error('no connector defined'));
      }

      const provider = Ethereum.getProvider();
      const isRemoteReady = this.connector.isReady();
      const isConnected = this.connector.isConnected();
      const isPaused = this.connector.isPaused();

      if (this.developerMode) {
        console.debug(
          `RemoteConnection::startConnection() isRemoteReady=${isRemoteReady} isRemoteConnected=${isConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
        );
      }

      if (this.connector.isReady()) {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::startConnection() Already connected.`,
          );
        }

        // Nothing to do, already connected.
        return resolve(true);
      }

      const platform = Platform.getInstance();
      const platformType = platform.getPlatformType();

      const showQRCode =
        platformType === PlatformType.DesktopWeb ||
        (platformType === PlatformType.NonBrowser && !platform.isReactNative());

      // Check for existing channelConfig?
      this.connector?.startAutoConnect().then((channelConfig) => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::startConnection after startAutoConnect`,
            channelConfig,
          );
        }

        if (channelConfig?.lastActive) {
          // Already connected through auto connect
          this.handleSecureReconnection({ channelConfig, deeplink: true });
        } else if (this.connector) {
          // generate new channel id
          this.connector
            .generateChannelId()
            .then(({ channelId, pubKey }) => {
              const linkParams = encodeURI(
                `channelId=${channelId}&comm=${this.communicationLayerPreference}&pubkey=${pubKey}`,
              );

              const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
              const deeplink = `metamask://connect?${linkParams}`;

              if (showQRCode) {
                this.displayedModal = InstallModal({
                  link: universalLink,
                  debug: this.developerMode,
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
              this.displayedModal?.onClose();
              reject(err);
            });

          this.connector.on(EventType.CLIENTS_READY, async () => {
            if (this.developerMode) {
              console.debug(
                `RemoteConnection::startConnection::on 'clients_ready' sentFirstConnect=${this.sentFirstConnect}`,
              );
            }

            if (this.sentFirstConnect) {
              resolve(true);
              return;
            }

            if (!provider.selectedAddress) {
              // Always make sure to requestAccounts
              await provider.request({
                method: 'eth_requestAccounts',
                params: [],
              });
            }
            this.sentFirstConnect = true;

            // try to close displayedModal
            this.displayedModal?.onClose();

            resolve(true);
          });
        }
      });
    });
  }

  getChannelConfig(): ChannelConfig | undefined {
    return this.connector?.getChannelConfig();
  }

  getKeyInfo(): KeyInfo | undefined {
    return this.connector?.getKeyInfo();
  }

  getConnector() {
    if (!this.connector) {
      throw new Error(`invalid remote connector`);
    }
    return this.connector;
  }

  isConnected() {
    return this.connector?.isReady() || false;
  }

  isPaused() {
    return this.connector?.isPaused();
  }

  disconnect(options?: DisconnectOptions): void {
    if (this.developerMode) {
      console.debug(`RemoteConnection::disconnect()`, options);
    }
    this.connector?.disconnect(options);
    const platform = Platform.getInstance();

    if (platform.isBrowser() || platform.isReactNative()) {
      // const provider = Ethereum.getProvider();
      // provider.handleDisconnect();
    }
  }
}
