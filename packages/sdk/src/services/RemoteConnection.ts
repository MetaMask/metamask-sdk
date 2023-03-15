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
    mount?: () => void;
    updateOTPValue?: (otpAnswer: string) => void;
  };

  private options: RemoteConnectionProps;

  /**
   * Wait for value from metamask mobile
   */
  private otpAnswer?: string;

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
        `RemoteConnection::initializeConnector() intialize connector`,
      );
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

    if (timer) {
      if (this.developerMode) {
        console.debug(`RemoteConnection::setup reset background timer`, timer);
      }

      timer?.stopBackgroundTimer?.();
      timer?.runBackgroundTimer?.(() => {
        // Used to maintain the connection when the app is backgrounded.
        // console.debug(`Running background timer`);
        return false;
      }, 5000);
    }

    if (autoConnect?.enable === true) {
      if (this.developerMode) {
        console.debug(
          `RemoteConnection::initializeConnector() autoconnect=${autoConnect}`,
        );
      }

      this.connector
        .startAutoConnect()
        .then((channelConfig?: ChannelConfig) => {
          if (channelConfig?.lastActive) {
            this.handleSecureReconnection({ channelConfig, deeplink: false });
          }
        });
    }

    if (!platform.isSecure()) {
      this.connector.on(EventType.OTP, (otpAnswer) => {
        console.debug(`RemoteConnection::on 'OTP' `, otpAnswer);
        this.otpAnswer = otpAnswer;
        if (this.displayedModal) {
          console.debug(`RemoteConnection::on 'OTP' MOUNT PENDING MODAL`);
          this.displayedModal.mount?.();
        } else {
          console.debug(`RemoteConnection::on 'OTP' init pending modal`);
          const onDisconnect = () => {
            this.options.modals.onPendingModalDisconnect?.();
            this.displayedModal?.onClose();
            this.displayedModal?.updateOTPValue?.('');
            this.displayedModal = undefined;
          };
          this.displayedModal = sdkPendingModal(onDisconnect);
        }
        this.displayedModal?.updateOTPValue?.(otpAnswer);

        const provider = Ethereum.getProvider();
        provider.on('_initialized', async () => {
          console.debug(`connection _initialized -- reset OTP value`);
          this.displayedModal?.onClose();
          this.displayedModal?.updateOTPValue?.('');
          this.otpAnswer = undefined;
        });
      });
    }

    this.connector.on(EventType.CLIENTS_READY, async () => {
      try {
        const provider = Ethereum.getProvider();
        await provider.forceInitializeState();

        if (this.developerMode) {
          console.debug(
            `RCPMS::on 'clients_ready' provider.state`,
            provider.getState(),
          );
        }
      } catch (err) {
        // Ignore error if already initialized.
        // console.debug(`IGNORE ERROR`, err);
      }
    });

    this.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
      if (this.developerMode) {
        console.debug(`[RCPMS] received '${EventType.CLIENTS_DISCONNECTED}'`);
      }

      this.sentFirstConnect = false;
      if (!platform.isSecure()) {
        const provider = Ethereum.getProvider();
        provider.handleDisconnect({ terminate: false });
        this.displayedModal?.updateOTPValue?.('');
      }
    });

    this.connector.on(EventType.TERMINATE, () => {
      if (typeof window === undefined) {
        if (this.developerMode) {
          console.debug(`TODO alert user from wallet termination.`);
        }
      } else {
        // TODO use a modal window instead
        // eslint-disable-next-line no-alert
        alert(`SDK Connection has been terminated from MetaMask.`);
      }
      this.displayedModal?.onClose();
      this.displayedModal = undefined;
      this.otpAnswer = undefined;

      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: true });
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
        `RemoteConnection::handleSecureReconnection() trustedDevice=${trustedDevice} deepLink=${deeplink} providerConnected=${provider.isConnected()} connector.connected=${this.connector.isConnected()}`,
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
        this.displayedModal = undefined;
      };

      const waitForOTP = async (): Promise<string> => {
        let checkOTPTrial = 0;
        while (checkOTPTrial < 100) {
          if (this.otpAnswer) {
            return this.otpAnswer;
          }
          await new Promise<void>((res) => setTimeout(() => res(), 1000));
          checkOTPTrial += 1;
        }
        return '';
      };

      if (this.displayedModal) {
        // Make sure modal is visible
        this.displayedModal.mount?.();
      } else {
        this.displayedModal = sdkPendingModal(onDisconnect);
      }

      waitForOTP().then((otp) => {
        this.displayedModal?.updateOTPValue?.(otp);
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

        const channelConfig = this.connector.getChannelConfig();
        if (channelConfig) {
          this.handleSecureReconnection({ channelConfig, deeplink: true });
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
      this.connector?.startAutoConnect().then(async (channelConfig) => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::startConnection after startAutoConnect`,
            channelConfig,
          );
        }

        if (channelConfig?.lastActive) {
          // Already connected through auto connect
          await this.handleSecureReconnection({
            channelConfig,
            deeplink: true,
          });

          return resolve(true);
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
              this.otpAnswer = undefined;
              this.displayedModal?.updateOTPValue?.('');
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

            this.sentFirstConnect = true;
            // try to close displayedModal
            this.displayedModal?.onClose();
            this.displayedModal = undefined;
            this.otpAnswer = undefined;

            resolve(true);
          });
        }

        return true;
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

    if (options?.terminate) {
      Ethereum.getProvider().handleDisconnect({ terminate: true });
      this.displayedModal?.onClose();
      this.displayedModal = undefined;
    }
    this.connector?.disconnect(options);
  }
}
