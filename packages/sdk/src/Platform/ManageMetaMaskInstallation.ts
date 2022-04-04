import MetaMaskOnboarding from '@metamask/onboarding';
import WalletConnect from '../services/WalletConnect';
import { waitPromise } from '../utils';
import Platform, {
  isMetaMaskInstalled,
  PlatformName,
} from '.';
import Ethereum from '../services/Ethereum';
import RemoteConnection from '../services/RemoteConnection';
import PostMessageStreams from '../PostMessageStreams';
// ethereum.on('connect', handler: (connectInfo: ConnectInfo) => void);
// ethereum.on('disconnect', handler: (error: ProviderRpcError) => void);

const ManageMetaMaskInstallation = {
  isInstalling: false,
  hasInstalled: false,
  resendRequest: null,
  preferDesktop: false,
  startDesktopOnboarding() {
    Ethereum.ethereum = null;
    delete window.ethereum;
    const onboardingExtension = new MetaMaskOnboarding();
    onboardingExtension.startOnboarding();
  },
  async redirectToProperInstall() {
    const platform = Platform.getPlatform();

    // If it's running on our mobile in-app browser but communication is still not working
    if (platform === PlatformName.MetaMaskMobileWebview) {
      // eslint-disable-next-line no-alert
      alert('Please save your seedphrase and try to reinstall MetaMask Mobile');
      return false;
    }

    // If is not installed and is Extension, start Extension onboarding
    if (platform === PlatformName.DesktopWeb) {
      this.isInstalling = true;
      if (this.preferDesktop) {
        this.startDesktopOnboarding();
        return false;
      }
    }

    // If is not installed, start remote connection
    const Remote = PostMessageStreams.useWalletConnect
      ? WalletConnect
      : RemoteConnection;

    this.isInstalling = true;
    const startedRemoteConnection = Remote.startConnection();
    if (startedRemoteConnection) {
      this.isInstalling = false;
      this.hasInstalled = true;
    }
    return startedRemoteConnection;
  },
  async checkInstallation() {
    const isInstalled = isMetaMaskInstalled();

    // No need to do anything
    if (isInstalled) {
      return true;
    }

    return this.redirectToProperInstall();
  },
  async start({ wait = false }) {
    // Give enough time for providers to make connection
    if (wait) {
      await waitPromise(1000);
    }

    return this.checkInstallation();
  },
};

export default ManageMetaMaskInstallation;
