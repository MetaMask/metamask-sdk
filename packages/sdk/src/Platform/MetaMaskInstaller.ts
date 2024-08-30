import { checkInstallation } from '../services/MetaMaskInstaller/checkInstallation';
import { redirectToProperInstall } from '../services/MetaMaskInstaller/redirectToProperInstall';
import { startDesktopOnboarding } from '../services/MetaMaskInstaller/startDesktopOnboarding';
import { startInstaller } from '../services/MetaMaskInstaller/startInstaller';
import { RemoteConnection } from '../services/RemoteConnection';
import { logger } from '../utils/logger';
import { PlatformManager } from './PlatfformManager';

// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

interface InstallerProps {
  preferDesktop: boolean;
  remote: RemoteConnection;
  platformManager: PlatformManager;
  debug?: boolean;
}

export interface RPCCall {
  method: string;
  params: unknown;
  id: string;
}

interface MetaMaskInstallerState {
  isInstalling: boolean;
  hasInstalled: boolean;
  resendRequest: any;
  preferDesktop: boolean;
  platformManager: PlatformManager | null;
  connectWith?: RPCCall;
  remote: RemoteConnection | null;
  debug: boolean;
}

/**
 * Singleton class instance
 */
export class MetaMaskInstaller {
  private static instance: MetaMaskInstaller;

  public state: MetaMaskInstallerState = {
    isInstalling: false,
    hasInstalled: false,
    resendRequest: null,
    preferDesktop: false,
    platformManager: null,
    remote: null,
    debug: false,
    connectWith: undefined,
  };

  public constructor({
    remote,
    preferDesktop,
    platformManager,
    debug = false,
  }: InstallerProps) {
    this.state.remote = remote;
    this.state.preferDesktop = preferDesktop;
    this.state.platformManager = platformManager;
    this.state.debug = debug;
  }

  startDesktopOnboarding() {
    return startDesktopOnboarding();
  }

  async redirectToProperInstall() {
    return redirectToProperInstall(this);
  }

  async checkInstallation() {
    return checkInstallation(this);
  }

  async start({
    wait = false,
    connectWith,
  }: {
    wait: boolean;
    connectWith?: RPCCall;
  }) {
    this.state.connectWith = connectWith;
    logger(`[MetaMaskInstaller: start()] wait=${wait}`, connectWith);
    await startInstaller(this, { wait });
  }
}
