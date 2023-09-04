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

/**
 * Singleton class instance
 */
export class MetaMaskInstaller {
  private static instance: MetaMaskInstaller;

  public isInstalling = false;

  public hasInstalled = false;

  public resendRequest = null;

  public preferDesktop = false;

  public platformManager: PlatformManager;

  public remote: ProviderService;

  public debug = false;

  public constructor({
    preferDesktop,
    remote,
    platformManager,
    debug = false,
  }: InstallerProps) {
    this.preferDesktop = preferDesktop;
    this.remote = remote;
    this.platformManager = platformManager;
    this.debug = debug;
  }

  startDesktopOnboarding() {
    return startDesktopOnboarding(this);
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
