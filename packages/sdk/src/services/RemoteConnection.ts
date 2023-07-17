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
  WebRTCLib,
} from '@metamask/sdk-communication-layer';
import packageJson from '../../package.json';
import { MAX_OTP_TRIALS } from '../config';
import { MetaMaskInstaller } from '../Platform/MetaMaskInstaller';
import { PlatformManager } from '../Platform/PlatfformManager';
import { SDKProvider } from '../provider/SDKProvider';
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
  webRTCLib?: WebRTCLib;
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

  private sentFirstConnect = false;

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
      webRTCLib,
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

    this.sentFirstConnect = false;

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::initializeConnector() intialize connector`,
      );
    }

    this.connector = new RemoteCommunication({
      platformType: platformManager.getPlatformType(),
      communicationLayerPreference,
      transports,
      webRTCLib,
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

        const provider = Ethereum.getProvider();
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

      this.sentFirstConnect = false;
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

      const provider = Ethereum.getProvider();
      provider.handleDisconnect({ terminate: true });
    });
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
   *  - ask user to reconnect via OTP.
   */
  // async handleSecureReconnection({
  //   channelConfig,
  // }: {
  //   channelConfig: ChannelConfig;
  //   // TODO what if we want to dsiplay deepkink on mobile web?
  //   skipDeeplinkOnMobileWeb?: boolean;
  // }) {
  //   const platformType = this.platformManager.getPlatformType();
  //   const trustedDevice = !(
  //     platformType === PlatformType.DesktopWeb ||
  //     (platformType === PlatformType.NonBrowser &&
  //       !this.platformManager.isReactNative())
  //   );
  //   const isRemoteReady = this.connector.isReady();
  //   const provider = Ethereum.getProvider();

  //   if (this.developerMode) {
  //     console.debug(
  //       `RemoteConnection::handleSecureReconnection() trustedDevice=${trustedDevice} deepLink=${deeplink} providerConnected=${provider.isConnected()} connector.connected=${this.connector.isConnected()}`,
  //       channelConfig,
  //     );
  //   }

  //   if (!isRemoteReady) {
  //     provider.emit('connecting');
  //   }

  //   if (trustedDevice) {
  //     const pubKey = this.getKeyInfo()?.ecies.public ?? '';
  //     let linkParams = encodeURI(
  //       `channelId=${channelConfig.channelId}&comm=${this.communicationLayerPreference}&pubkey=${pubKey}`,
  //     );

  //     if (provider.isConnected()) {
  //       linkParams += `&redirect=true`;
  //     }

  //     const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
  //     const link = `metamask://connect?${linkParams}`;

  //     this.platformManager.openDeeplink?.(universalLink, link, '_self');
  //   } else if (!trustedDevice) {
  //     const onDisconnect = () => {
  //       this.options.modals.onPendingModalDisconnect?.();
  //       this.pendingModal?.unmount?.();
  //     };

  //     const waitForOTP = async (): Promise<string> => {
  //       let checkOTPTrial = 0;
  //       while (checkOTPTrial < MAX_OTP_TRIALS) {
  //         if (this.otpAnswer) {
  //           return this.otpAnswer;
  //         }
  //         await new Promise<void>((res) => setTimeout(() => res(), 1000));
  //         checkOTPTrial += 1;
  //       }
  //       return '';
  //     };

  //     if (this.pendingModal) {
  //       this.pendingModal?.mount?.();
  //     } else {
  //       this.pendingModal = this.options.modals.otp?.(onDisconnect);
  //     }

  //     const otp = await waitForOTP();
  //     if (this.otpAnswer !== otp) {
  //       this.otpAnswer = otp;
  //       this.pendingModal?.updateOTPValue?.(otp);
  //     }
  //   }
  // }

  /**
   * This will start the installer or pending modal and resolve once it is displayed.
   * It doesn't wait for the actual connection to be authorized.
   */
  async startConnection(): Promise<void> {
    if (!this.connector) {
      throw new Error('no connector defined');
    }

    const provider = Ethereum.getProvider();
    const hasActiveConnection = await this.checkForActiveSocketConnection({
      provider,
    });

    if (hasActiveConnection) {
      console.warn(`RemoteConnection::startConnection() already connected`);
      return;
    }

    // Establish socket connection
    provider.emit('connecting');

    const channelConfig = await this.connector?.originatorConnect();
    if (this.developerMode) {
      console.debug(
        `RemoteConnection::startConnection after startAutoConnect`,
        channelConfig,
      );
    }

    await this.connectWithWallet(channelConfig);
  }

  private async checkForActiveSocketConnection({
    provider,
  }: {
    provider: SDKProvider;
  }): Promise<boolean> {
    const isRemoteReady = this.connector.isReady();
    const isConnected = this.connector.isConnected();
    const isPaused = this.connector.isPaused();

    if (this.developerMode) {
      console.debug(
        `RemoteConnection::startConnection() isRemoteReady=${isRemoteReady} isRemoteConnected=${isConnected} isRemotePaused=${isPaused} providerConnected=${provider.isConnected()}`,
      );
    }

    if (isRemoteReady) {
      // should either display pending modal for OTP or deeplink into metamask.
      if (this.developerMode) {
        console.debug(`RemoteConnection::startConnection() Already connected.`);
      }

      // // Necessary on secure device because ready doesn't mean the wallet is actually live.
      // // handlesecure reconnection will deeplink into it to make sure to wake it up.
      // const channelConfig = this.connector.getChannelConfig();
      // if (channelConfig) {
      //   await this.handleSecureReconnection({
      //     channelConfig,
      //   });
      // }
      // Do a quick reconnect to make sure the connection is still alive.
      console.error(`need to do a quick reconnect`);

      // Nothing to do, already connected.
      return true;
    } else if (isConnected) {
      if (!this.platformManager.isSecure()) {
        this.showInstallModal({ link: this.getUniversalLink() });
      }
      return true;
    }

    return false;
  }

  /**
   * Tries to establish the connection to the wallet by displaying the modal to scan QRCode or using extension for web.
   * On mobile (secure platform), it will open the deeplink to MetaMask.
   */
  private async connectWithWallet(channelConfig?: ChannelConfig) {
    let channelId = channelConfig?.channelId ?? '';
    let pubKey = this.getKeyInfo()?.ecies.public ?? '';

    if (!channelConfig) {
      const newChannel = await this.connector.generateChannelId();
      channelId = newChannel.channelId ?? '';
      pubKey = this.getKeyInfo()?.ecies.public ?? '';
    }

    const linkParams = encodeURI(
      `channelId=${channelId}&comm=${this.communicationLayerPreference}&pubkey=${pubKey}`,
    );

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
      let checkOTPTrial = 0;
      while (checkOTPTrial < MAX_OTP_TRIALS) {
        if (this.otpAnswer) {
          return this.otpAnswer;
        }
        await new Promise<void>((res) => setTimeout(() => res(), 1000));
        checkOTPTrial += 1;
      }
      return '';
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
          reject(type);
        },
      );

      // FIXME shouldn't it make more sense to actually wait for full connection and 'authorized' event?
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

  /**
   * Display the installation modal
   *
   * @param param.link link of the qrcode
   * @returns
   */
  showInstallModal({ link }: { link: string }) {
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
