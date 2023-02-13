import MetaMaskOnboarding from '@metamask/onboarding';
import { Ethereum } from '../services/Ethereum';
import { ProviderService } from '../services/ProviderService';
import { PlatformType } from '../types/PlatformType';
import { waitPromise } from '../utils/waitPromise';
import { Platform } from './Platfform';

// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

interface InstallerProps {
  preferDesktop: boolean;
  remote: ProviderService;
  debug?: boolean;
}

/**
 * Singleton class instance
 */
export class MetaMaskInstaller {
  private static instance: MetaMaskInstaller;

  private isInstalling = false;

  private hasInstalled = false;

  private resendRequest = null;

  private preferDesktop = false;

  private remote: ProviderService;

  private debug = false;

  private constructor({
    preferDesktop,
    remote,
    debug = false,
  }: InstallerProps) {
    this.preferDesktop = preferDesktop;
    this.remote = remote;
    this.debug = debug;
  }

  public static init(props: InstallerProps): MetaMaskInstaller {
    MetaMaskInstaller.instance = new MetaMaskInstaller(props);
    return MetaMaskInstaller.instance;
  }

  public static getInstance(): MetaMaskInstaller {
    if (!MetaMaskInstaller.instance) {
      throw new Error(
        'MetaMask installer not initialized - call MetaMaskInstaller.init() first.',
      );
    }

    return MetaMaskInstaller.instance;
  }

  startDesktopOnboarding() {
    if (this.debug) {
      console.debug(`MetamaskInstaller::startDesktopOnboarding()`);
    }
    Ethereum.destroy();
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
  }

  async redirectToProperInstall() {
    if (this.debug) {
      console.debug(`MetamaskInstaller::redirectToProperInstall() `);
    }
    const platformType = Platform.getInstance().getPlatformType();

    // If it's running on our mobile in-app browser but communication is still not working
    if (platformType === PlatformType.MetaMaskMobileWebview) {
      // eslint-disable-next-line no-alert
      alert('Please save your seedphrase and try to reinstall MetaMask Mobile');
      return false;
    }

    // If is not installed and is Extension, start Extension onboarding
    if (platformType === PlatformType.DesktopWeb) {
      this.isInstalling = true;
      if (this.preferDesktop) {
        this.startDesktopOnboarding();
        return false;
      }
    }

    // If is not installed, start remote connection
    this.isInstalling = true;
    try {
      const startedRemoteConnection = await this.remote.startConnection();
      if (startedRemoteConnection) {
        this.isInstalling = false;
        this.hasInstalled = true;
      }
      return startedRemoteConnection;
    } catch (err) {
      console.error(`An error occured`, err);
    }
    return false;
  }

  async checkInstallation() {
    const isInstalled = Platform.getInstance().isMetaMaskInstalled();

    if (this.debug) {
      console.log(
        `MetamaskInstaller::checkInstallation() isInstalled=${isInstalled}`,
      );
    }

    // No need to do anything
    if (isInstalled) {
      return true;
    }

    return await this.redirectToProperInstall();
  }

  async start({ wait = false }: { wait: boolean }) {
    if (this.debug) {
      console.debug(`MetamaskInstaller::start() wait=${wait}`);
    }

    // Give enough time for providers to make connection
    if (wait) {
      await waitPromise(1000);
    }

    return await this.checkInstallation();
  }
}
