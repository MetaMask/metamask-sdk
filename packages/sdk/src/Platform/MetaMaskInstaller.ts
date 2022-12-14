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
}

export class MetaMaskInstaller {
  isInstalling = false;

  hasInstalled = false;

  resendRequest = null;

  preferDesktop = false;

  remote: ProviderService;

  constructor({ preferDesktop, remote }: InstallerProps) {
    this.preferDesktop = preferDesktop;
    this.remote = remote;
  }

  startDesktopOnboarding() {
    Ethereum.destroy();
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
  }

  async redirectToProperInstall() {
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
    const startedRemoteConnection = await this.remote.startConnection();
    if (startedRemoteConnection) {
      this.isInstalling = false;
      this.hasInstalled = true;
    }
    return startedRemoteConnection;
  }

  async checkInstallation() {
    const isInstalled = Platform.getInstance().isMetaMaskInstalled();

    // No need to do anything
    if (isInstalled) {
      return true;
    }

    return await this.redirectToProperInstall();
  }

  async start({ wait = false }) {
    // Give enough time for providers to make connection
    if (wait) {
      await waitPromise(1000);
    }

    return this.checkInstallation();
  }
}
