import {
  ChannelConfig,
  CommunicationLayerPreference,
  DappMetadata,
  DisconnectOptions,
  ECIESProps,
  KeyInfo,
  RemoteCommunication,
  StorageManagerProps,
} from '@metamask/sdk-communication-layer';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { PlatformManager } from '../../Platform/PlatfformManager';
import { MetaMaskSDK } from '../../sdk';
import { SDKLoggingOptions } from '../../types/SDKLoggingOptions';
import InstallModal from '../../ui/InstallModal/installModal';
import PendingModal from '../../ui/InstallModal/pendingModal';
import { Ethereum } from '../Ethereum';
import { ProviderService } from '../ProviderService';
import { initializeConnector } from './ConnectionInitializer/initializeConnector';
import { startConnection } from './ConnectionManager/startConnection';
import { setupListeners } from './EventListeners/setupListeners';

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

export interface RemoteConnectionState {
  connector: RemoteCommunication | undefined;
  universalLink: string | undefined;
  developerMode: boolean;
  authorized: boolean;
  communicationLayerPreference: CommunicationLayerPreference | undefined;
  platformManager: PlatformManager | undefined;
  pendingModal:
    | {
        mount?: () => void;
        updateOTPValue?: (otpValue: string) => void;
        unmount?: () => void;
      }
    | undefined;
  installModal:
    | {
        unmount?: (shouldTerminate: boolean) => void;
        mount?: (link: string) => void;
      }
    | undefined;
  /**
   * Wait for value from metamask mobile
   */
  otpAnswer: string | undefined;
}

export class RemoteConnection implements ProviderService {
  private options: RemoteConnectionProps;

  private state: RemoteConnectionState = {
    connector: undefined,
    universalLink: undefined,
    developerMode: false,
    authorized: false,
    communicationLayerPreference: undefined,
    platformManager: undefined,
    pendingModal: {},
    installModal: {},
    otpAnswer: undefined,
  };

  constructor(options: RemoteConnectionProps) {
    this.options = options;
    const developerMode =
      options.logging?.developerMode === true || options.logging?.sdk === true;
    this.state.developerMode = developerMode;
    this.state.communicationLayerPreference =
      options.communicationLayerPreference;
    this.state.platformManager = options.platformManager;

    // Set default modals implementation
    if (!options.modals.install) {
      options.modals.install = InstallModal;
    }

    if (!options.modals.otp) {
      options.modals.otp = PendingModal;
    }

    this.state.connector = initializeConnector({
      options: this.options,
      developerMode: this.state.developerMode,
    });

    setupListeners(this.state, this.options);
  }

  /**
   * This will start the installer or pending modal and resolve once it is displayed.
   * It doesn't wait for the actual connection to be authorized.
   */
  async startConnection(): Promise<void> {
    await startConnection(this.state, this.options);
  }

  getUniversalLink() {
    if (!this.state.universalLink) {
      throw new Error('connection not started. run startConnection() first.');
    }
    return this.state.universalLink;
  }

  showActiveModal() {
    if (this.state.authorized) {
      if (this.state.developerMode) {
        console.debug(`RemoteConnection::showActiveModal() already authorized`);
      }
      return;
    }

    if (this.state.pendingModal) {
      // only display the modal if the connection is not authorized
      this.state.pendingModal.mount?.();
    } else if (this.state.installModal) {
      this.state.installModal.mount?.(this.getUniversalLink());
    }
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

  getPlatformManager() {
    if (!this.state.platformManager) {
      throw new Error('platformManager is not initialized');
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
    if (this.state.developerMode) {
      console.debug(`RemoteConnection::disconnect()`, options);
    }

    if (options?.terminate) {
      Ethereum.getProvider().handleDisconnect({
        terminate: true,
      });
      this.state.pendingModal?.unmount?.();
      this.state.otpAnswer = undefined;
    }
    this.state.connector?.disconnect(options);
  }
}
