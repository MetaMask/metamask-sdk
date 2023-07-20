import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import {
  ChannelConfig,
  CommunicationLayerPreference,
  DappMetadata,
  DisconnectOptions,
  ECIESProps,
  EventType,
  KeyInfo,
  RemoteCommunication,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import packageJson from '../../package.json';
import { MetaMaskInstaller } from '../Platform/MetaMaskInstaller';
import { PlatformManager } from '../Platform/PlatfformManager';
import { MetaMaskSDK } from '../sdk';
import { PROVIDER_UPDATE_TYPE } from '../types/ProviderUpdateType';
import { SDKLoggingOptions } from '../types/SDKLoggingOptions';
import InstallModal from '../ui/InstallModal/installModal';
import PendingModal from '../ui/InstallModal/pendingModal';
import { Ethereum } from './Ethereum';
import { ProviderService } from './ProviderService';

export interface RemoteConnectionProps {
  timer?: {
    runBackgroundTimer?: (cb: () => void, ms: number) => number;
    stopBackgroundTimer?: () => void;
  };
  communicationLayerPreference: CommunicationLayerPreference;
  dappMetadata?: DappMetadata;
  _source?: string;
  enableDebug?: boolean;
  sdk: MetaMaskSDK;
  transports?: string[];
  platformManager: PlatformManager;
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
  // Prevent circular dependencies
  getMetaMaskInstaller: () => MetaMaskInstaller;
  connectWithExtensionProvider?: () => void;
  modals: {
    onPendingModalDisconnect?: () => void;
    install?: (params: {
      link: string;
      debug?: boolean;
      installer: MetaMaskInstaller;
      terminate?: () => void;
      connectWithExtension?: () => void;
    }) => {
      unmount?: (shouldTerminate?: boolean) => void;
      mount?: (link: string) => void;
    };
    otp?: (onDisconnect?: () => void) => {
      mount?: () => void;
      updateOTPValue?: (otpValue: string) => void;
      unmount?: () => void;
    };
  };
}

export class RemoteConnection implements ProviderService {
  private connector: RemoteCommunication;

  private universalLink?: string;

  private developerMode: boolean;

  private authorized = false;

  private communicationLayerPreference: CommunicationLayerPreference;

  private platformManager: PlatformManager;

  private pendingModal?: {
    mount?: () => void;
    updateOTPValue?: (otpValue: string) => void;
    unmount?: () => void;
  };

  private installModal?: {
    unmount?: (shouldTerminate: boolean) => void;
    mount?: (link: string) => void;
  };

  private options: RemoteConnectionProps;

  /**
   * Wait for value from metamask mobile
   */
  private otpAnswer?: string;

  constructor(options: RemoteConnectionProps) {
    this.options = options;
    const developerMode =
      options.logging?.developerMode === true || options.logging?.sdk === true;
    this.developerMode = developerMode;
    this.communicationLayerPreference = options.communicationLayerPreference;
    this.platformManager = options.platformManager;

    // Set default modals implementation
    if (!options.modals.install) {
      options.modals.install = InstallModal;
    }

    if (!options.modals.otp) {
      options.modals.otp = PendingModal;
    }
    this.connector = this.initializeConnector();
  }

  private initializeConnector() {
    const {
      dappMetadata,
      communicationLayerPreference,
      transports,
      _source,
      enableDebug = false,
      platformManager,
      timer,
      ecies,
      storage,
      communicationServerUrl,
      logging,
    } = this.options;

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::initializeConnector() intialize connector`,
      );
    }

    this.connector = new RemoteCommunication({
      platformType: platformManager.getPlatformType(),
      communicationLayerPreference,
      transports,
      dappMetadata: { ...dappMetadata, source: _source },
      analytics: enableDebug,
      communicationServerUrl,
      sdkVersion: packageJson.version,
      context: 'dapp',
      ecies,
      storage,
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
      }, 10000);
    }

    if (!platformManager.isSecure()) {
      this.connector.on(EventType.OTP, (otpAnswer: string) => {
        // Prevent double handling OTP message
        if (this.otpAnswer === otpAnswer) {
          return;
        }

        if (this.developerMode) {
          console.debug(`RemoteConnection::on 'OTP' `, otpAnswer);
        }
        this.otpAnswer = otpAnswer;
        if (!this.pendingModal) {
          if (this.developerMode) {
            console.debug(`RemoteConnection::on 'OTP' init pending modal`);
          }

          const onDisconnect = () => {
            this.options.modals.onPendingModalDisconnect?.();
            this.pendingModal?.unmount?.();
            this.pendingModal?.updateOTPValue?.('');
          };
          this.pendingModal = this.options.modals.otp?.(onDisconnect);
        }
        this.pendingModal?.updateOTPValue?.(otpAnswer);
        this.pendingModal?.mount?.();
      });
    }

    this.setupListeners();

    return this.connector;
  }

  private setupListeners() {
    // TODO this event can probably be removed in future version as it was created to maintain backward compatibility with older wallet (< 7.0.0).
    this.connector.on(
      EventType.SDK_RPC_CALL,
      async (requestParams: RequestArguments) => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::on 'sdk_rpc_call' requestParam`,
            requestParams,
          );
        }
        const provider = Ethereum.getProvider();
        const result = await provider.request(requestParams);
        if (this.developerMode) {
          console.debug(`RemoteConnection::on 'sdk_rpc_call' result`, result);
        }
        // Close opened modals
        this.pendingModal?.unmount?.();
      },
    );

    this.connector.on(EventType.AUTHORIZED, async () => {
      try {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::on 'authorized' closing modals`,
            this.pendingModal,
            this.installModal,
          );
        }
        // close modals
        this.pendingModal?.unmount?.();
        this.installModal?.unmount?.(false);
        this.otpAnswer = undefined;
        this.authorized = true;

        const provider = Ethereum.getProvider();
        provider.emit('connect');

        if (this.developerMode) {
          console.debug(
            `RCPMS::on 'authorized' provider.state`,
            provider.getState(),
          );
        }
        await provider.forceInitializeState();
      } catch (err) {
        // Ignore error if already initialized.
        // console.debug(`IGNORE ERROR`, err);
      }
    });

    this.connector.on(EventType.CLIENTS_DISCONNECTED, () => {
      if (this.developerMode) {
        console.debug(`[RCPMS] received '${EventType.CLIENTS_DISCONNECTED}'`);
      }

      if (!this.platformManager.isSecure()) {
        const provider = Ethereum.getProvider();
        provider.handleDisconnect({ terminate: false });
        this.pendingModal?.updateOTPValue?.('');
      }
    });

    this.connector.on(EventType.TERMINATE, () => {
      if (this.platformManager.isBrowser()) {
        // TODO use a modal or let user customize messsage instead
        // eslint-disable-next-line no-alert
        alert(`SDK Connection has been terminated from MetaMask.`);
      } else {
        console.info(`SDK Connection has been terminated`);
      }
      this.pendingModal?.unmount?.();
      this.pendingModal = undefined;
      this.otpAnswer = undefined;
      this.authorized = false;

      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: true });
    });
  }

  /**
   * Display the installation modal
   *
   * @param param.link link of the qrcode
   * @returns
   */
  private showInstallModal({ link }: { link: string }) {
    // prevent double initialization
    if (this.installModal) {
      if (this.developerMode) {
        console.debug(
          `RemoteConnection::showInstallModal() install modal already initialized`,
          this.installModal,
        );
      }
      this.installModal.mount?.(link);
      return;
    }

    this.installModal = this.options.modals.install?.({
      link,
      installer: this.options.getMetaMaskInstaller(),
      terminate: () => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::showInstallModal() terminate connection`,
          );
        }
        this.options.sdk.terminate();
      },
      debug: this.developerMode,
      connectWithExtension: () => {
        this.options.connectWithExtensionProvider?.();
        return false;
      },
    });
    this.installModal?.mount?.(link);
  }

  /**
   * This will start the installer or pending modal and resolve once it is displayed.
   * It doesn't wait for the actual connection to be authorized.
   */
  async startConnection(): Promise<void> {
    if (!this.connector) {
      throw new Error('no connector defined');
    }

    const provider = Ethereum.getProvider();

    // reset authorization state
    this.authorized = false;

    // Establish socket connection
    provider.emit('connecting');

    const channelConfig = await this.connector?.originatorSessionConnect();
    if (this.developerMode) {
      console.debug(
        `RemoteConnection::startConnection after startAutoConnect`,
        channelConfig,
      );
    }

    let channelId = channelConfig?.channelId ?? '';
    let pubKey = this.getKeyInfo()?.ecies.public ?? '';

    if (!channelConfig) {
      const newChannel = await this.connector.generateChannelIdConnect();
      channelId = newChannel.channelId ?? '';
      pubKey = this.getKeyInfo()?.ecies.public ?? '';
    }

    const linkParams = encodeURI(
      `channelId=${channelId}&comm=${this.communicationLayerPreference}&pubkey=${pubKey}`,
    );
    const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
    this.universalLink = universalLink;

    // first handle secure connection
    if (this.platformManager.isSecure()) {
      // FIXME do we also need to wait for event on secure platform? ready / authorized
      return this.connectWithDeeplink({ linkParams });
    }

    if (channelConfig?.lastActive) {
      return this.reconnectWithModalOTP();
    }

    return this.connectWithModalInstaller({ linkParams });
  }

  private async reconnectWithModalOTP() {
    const onDisconnect = () => {
      this.options.modals.onPendingModalDisconnect?.();
      this.pendingModal?.unmount?.();
    };

    const waitForOTP = async (): Promise<string> => {
      while (this.otpAnswer === undefined) {
        await new Promise<void>((res) => setTimeout(() => res(), 1000));
      }
      return this.otpAnswer;
    };

    if (this.pendingModal) {
      this.pendingModal?.mount?.();
    } else {
      this.pendingModal = this.options.modals.otp?.(onDisconnect);
    }

    const otp = await waitForOTP();
    if (this.otpAnswer !== otp) {
      this.otpAnswer = otp;
      this.pendingModal?.updateOTPValue?.(otp);
    }
  }

  private async connectWithDeeplink({ linkParams }: { linkParams: string }) {
    const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
    const deeplink = `metamask://connect?${linkParams}`;

    // console.log('OPEN LINK', universalLink);
    this.platformManager.openDeeplink?.(universalLink, deeplink, '_self');
  }

  private async connectWithModalInstaller({
    linkParams,
  }: {
    linkParams: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
      this.showInstallModal({ link: universalLink });
      // Event means browser extension is selected, interrupt gracefully.
      this.options.sdk.once(
        EventType.PROVIDER_UPDATE,
        async (type: PROVIDER_UPDATE_TYPE) => {
          // handle the provider change in initializeProvider
          if (this.developerMode) {
            console.debug(
              `RemoteConnection::startConnection::on 'provider_update' -- resolving startConnection promise`,
            );
          }
          reject(type);
        },
      );

      // TODO shouldn't it make more sense to actually wait for full connection and 'authorized' event?
      this.connector.once(EventType.CLIENTS_READY, async () => {
        if (this.developerMode) {
          console.debug(
            `RemoteConnection::startConnection::on 'clients_ready' -- resolving startConnection promise`,
          );
        }

        // Allow initializeProvider to complete and send the eth_requestAccounts
        resolve();
      });
    });
  }

  getUniversalLink() {
    if (!this.universalLink) {
      throw new Error('connection not started. run startConnection() first.');
    }
    return this.universalLink;
  }

  showActiveModal() {
    if (this.authorized) {
      if (this.developerMode) {
        console.debug(`RemoteConnection::showActiveModal() already authorized`);
      }
      return;
    }

    if (this.pendingModal) {
      // only display the modal if the connection is not authorized
      this.pendingModal.mount?.();
    } else if (this.installModal) {
      this.installModal.mount?.(this.getUniversalLink());
    }
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

  getPlatformManager() {
    return this.platformManager;
  }

  isConnected() {
    return this.connector?.isReady() || false;
  }

  isAuthorized() {
    return this.connector?.isAuthorized() || false;
  }

  isPaused() {
    return this.connector?.isPaused();
  }

  disconnect(options?: DisconnectOptions): void {
    if (this.developerMode) {
      console.debug(`RemoteConnection::disconnect()`, options);
    }

    if (options?.terminate) {
      Ethereum.getProvider().handleDisconnect({
        terminate: true,
      });
      this.pendingModal?.unmount?.();
      this.otpAnswer = undefined;
    }
    this.connector?.disconnect(options);
  }
}
