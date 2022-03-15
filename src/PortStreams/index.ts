import { isMetaMaskMobileWebView, isMobile } from '../environmentCheck';
import WalletConnect from '../services/WalletConnect';
import MobilePortStream from './MobilePortStream';
import WalletConnectPortStream from './WalletConnectPortStream';

const portStreamToUse = () => {
  // Is our webview / in-app browser
  if (isMetaMaskMobileWebView()) {
    return MobilePortStream;
  }

  const isMobile_ = isMobile();

  // Is a mobile browser (other than our webview)
  if (isMobile_) {
    return WalletConnectPortStream;
  }

  // Is a desktop browser
  if (!isMobile_) {
    WalletConnect.isDesktop = true;
    return WalletConnectPortStream;
  }

  return false;
};

export default portStreamToUse;
