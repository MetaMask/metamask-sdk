import { isMetaMaskMobileWebView, isMobile } from '../environmentCheck';
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
    return false;
  }

  return false;
};

export default portStreamToUse;
