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
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { PlatformManager } from '../../Platform/PlatfformManager';
import { MetaMaskSDK } from '../../sdk';
import { SDKLoggingOptions } from '../../types/SDKLoggingOptions';
import InstallModal from '../../ui/InstallModal/installModal';
import PendingModal from '../../ui/InstallModal/pendingModal';
import { logger } from '../../utils/logger';
import { Analytics } from '../Analytics';
import { Ethereum } from '../Ethereum';
import { initializeConnector } from './ConnectionInitializer';
import { cleanupConnector } from './ConnectionInitializer/cleanupConnector';
import { startConnection, StartConnectionExtras } from './ConnectionManager';
import { EventHandler, setupListeners } from './EventListeners';
import { showActiveModal } from './ModalManager';

export interface RemoteConnectionProps {
  anonId: string;
  timer?: {
    runBackgroundTimer?: (cb: () => void, ms: number) => number;
    stopBackgroundTimer?: () => void;
  };
  communicationLayerPreference: CommunicationLayerPreference;
  dappMetadata?: DappMetadata;
  _source?: string;
  enableAnalytics?: boolean;
  analytics: Analytics;
  sdk: MetaMaskSDK;
  transports?: string[];
  platformManager: PlatformManager;
  communicationServerUrl?: string;
  ecies?: ECIESProps;
  storage?: StorageManagerProps;
  logging?: SDKLoggingOptions;
  preferDesktop?: boolean;
  // Prevent circular dependencies
  getMetaMaskInstaller: () => MetaMaskInstaller;
  connectWithExtensionProvider?: () => void;
  /**
   * @deprecated Use the 'display_uri' event on the provider instead.
   * Listen to this event to get the QR code URL and customize your UI.
   * Example:
   * sdk.getProvider().on('display_uri', (uri: string) => {
   *   // Use the uri to display a QR code or customize your UI
   * });
   */
  modals: {
    onPendingModalDisconnect?: () => void;
    install?: (args: {
      link: string;
      debug?: boolean;
      preferDesktop?: boolean;
      installer: MetaMaskInstaller;
      terminate?: () => void;
      connectWithExtension?: () => void;
      onAnalyticsEvent: ({
        event,
        params,
      }: {
        event: TrackingEvents;
        params?: Record<string, unknown>;
      }) => void;
    }) => {
      unmount?: (shouldTerminate?: boolean) => void;
      mount?: (link: string) => void;
    };
    otp?: ({
      debug,
      onDisconnect,
    }: {
      debug?: boolean;
      onDisconnect?: () => void;
    }) => {
      mount?: () => void;
      updateOTPValue?: (otpValue: string) => void;
      unmount?: () => void;
    };
  };
}

export interface RemoteConnectionState {
  connector?: RemoteCommunication;
  qrcodeLink?: string;
  useDeeplink?: boolean;
  hideReturnToAppModal?: boolean;
  developerMode: boolean;
  analytics?: Analytics;
  authorized: boolean;
  reconnection: boolean;
  deeplinkProtocol: boolean;
  preferDesktop?: boolean;
  listeners: { event: EventType; handler: EventHandler }[];
  communicationLayerPreference?: CommunicationLayerPreference;
  platformManager?: PlatformManager;
  pendingModal?: {
    mount?: (props?: { displayOTP?: boolean }) => void;
    updateOTPValue?: (otpValue: string) => void;
    unmount?: () => void;
  };

  installModal?: {
    unmount?: (shouldTerminate: boolean) => void;
    mount?: (link: string) => void;
  };
  /**
   * Wait for value from metamask mobile
   */
  otpAnswer?: string;
}

export class RemoteConnection {
  private options: RemoteConnectionProps;

  public state: RemoteConnectionState = {
    connector: undefined,
    qrcodeLink: undefined,
    analytics: undefined,
    developerMode: false,
    authorized: false,
    reconnection: false,
    preferDesktop: false,
    deeplinkProtocol: false,
    listeners: [],
    communicationLayerPreference: undefined,
    platformManager: undefined,
    pendingModal: undefined,
    installModal: undefined,
    otpAnswer: undefined,
  };

  constructor(options: RemoteConnectionProps) {
    this.options = options;
    const developerMode =
      options.logging?.developerMode === true || options.logging?.sdk === true;
    this.state.developerMode = developerMode;
    this.state.analytics = options.analytics;
    this.state.preferDesktop = options.preferDesktop ?? false;
    this.state.useDeeplink = options.sdk.options.useDeeplink;
    this.state.hideReturnToAppModal = options.sdk.options.hideReturnToAppModal;
    this.state.communicationLayerPreference =
      options.communicationLayerPreference;
    this.state.platformManager = options.platformManager;

    // Set default modals implementation
    // @ts-error backward compatibility
    if (!options.modals.install) {
      // @ts-error backward compatibility
      options.modals.install = InstallModal;
    }

    if (!options.modals.otp) {
      options.modals.otp = PendingModal;
    }
  }

  /**
   * This will start the installer or pending modal and resolve once it is displayed.
   * It doesn't wait for the actual connection to be authorized.
   */
  async startConnection(extras?: StartConnectionExtras): Promise<void> {
    return startConnection(this.state, this.options, extras);
  }

  async initRemoteCommunication({
    sdkInstance,
  }: {
    sdkInstance: MetaMaskSDK;
  }): Promise<void> {
    // get channel config
    const channelConfig =
      await sdkInstance.options.storage?.storageManager?.getPersistedChannelConfig();

    if (!this.options.ecies) {
      const eciesProps: ECIESProps = {
        privateKey: channelConfig?.localKey,
      };
      this.options.ecies = eciesProps;
    }
    initializeConnector(this.state, this.options);
    await this.getConnector()?.initFromDappStorage();

    setupListeners(this.state, this.options);
  }

  showActiveModal() {
    return showActiveModal(this.state);
  }

  closeModal() {
    this.state.pendingModal?.unmount?.();
    this.state.installModal?.unmount?.(false);
  }

  getUniversalLink() {
    if (!this.state.qrcodeLink) {
      throw new Error('connection not started. run startConnection() first.');
    }
    return this.state.qrcodeLink;
  }

  getChannelConfig(): ChannelConfig | undefined {
    return this.state.connector?.getChannelConfig();
  }

  getKeyInfo(): KeyInfo | undefined {
    return this.state.connector?.getKeyInfo();
  }

  getConnector() {
    if (!this.state.connector) {
      throw new Error(`invalid remote connector`);
    }
    return this.state.connector;
  }

  getPlatformManager(): PlatformManager {
    if (!this.state.platformManager) {
      throw new Error('PlatformManager not available');
    }

    return this.state.platformManager;
  }

  isConnected() {
    return this.state.connector?.isReady() || false;
  }

  isAuthorized() {
    return this.state.connector?.isAuthorized() || false;
  }

  isPaused() {
    return this.state.connector?.isPaused();
  }

  disconnect(options?: DisconnectOptions): void {
    logger(`[RemoteConnection: disconnect()]`, options);

    if (options?.terminate) {
      Ethereum.getProvider().handleDisconnect({
        terminate: true,
      });
      this.state.pendingModal?.unmount?.();
      this.state.otpAnswer = undefined;
    }
    this.state.connector?.disconnect(options);
    cleanupConnector(this.state);
  }
}
