import { checkInstallation } from '../services/MetaMaskInstaller/checkInstallation';
import { redirectToProperInstall } from '../services/MetaMaskInstaller/redirectToProperInstall';
import { startDesktopOnboarding } from '../services/MetaMaskInstaller/startDesktopOnboarding';
import { startInstaller } from '../services/MetaMaskInstaller/startInstaller';
import { ProviderService } from '../services/ProviderService';
import { PlatformManager } from './PlatfformManager';

// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

interface InstallerProps {
  preferDesktop: boolean;
  remote: ProviderService;
  platformManager: PlatformManager;
  debug?: boolean;
}

interface MetaMaskInstallerState {
  isInstalling: boolean;
  hasInstalled: boolean;
  resendRequest: any;
  preferDesktop: boolean;
  platformManager: PlatformManager | null;
  remote: ProviderService | null;
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
  };

  public constructor({
    preferDesktop,
    remote,
    platformManager,
    debug = false,
  }: InstallerProps) {
    this.state.preferDesktop = preferDesktop;
    this.state.remote = remote;
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

  async start({ wait = false }: { wait: boolean }) {
    return await startInstaller(this, { wait });
  }
}
