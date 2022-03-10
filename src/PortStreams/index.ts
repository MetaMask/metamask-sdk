import { isMetaMaskMobileWebView, isMobile } from '../environmentCheck';
import MobilePortStream from '../mobile/MobilePortStream';

const portStreamToUse = () => {
  if (isMetaMaskMobileWebView()) {
    return MobilePortStream;
  }

  const isMobile_ = isMobile();
  if (isMobile_) {
    alert('USE Waku');
    return false;
  }

  if (!isMobile_) {
    return false;
  }

  return false;
};

export default portStreamToUse;
