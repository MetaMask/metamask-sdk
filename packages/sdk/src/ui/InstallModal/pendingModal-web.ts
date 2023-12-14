import { ModalLoader } from '@metamask/sdk-install-modal-web';
import { i18n } from 'i18next';
import packageJson from '../../../package.json';

const sdkWebPendingModal = ({
  debug,
  onDisconnect,
  i18nInstance,
}: {
  debug?: boolean;
  onDisconnect?: () => void;
  i18nInstance: i18n;
}) => {
  let div: HTMLDivElement | null = null;
  let modalLoader: ModalLoader | null = null;

  const unmount = () => {
    if (debug) {
      console.log(`pendingModal-web unmount`, div);
    }

    // Remove the node from the DOM
    if (div?.parentNode) {
      div.parentNode.removeChild(div);
    }

    div = null;
    modalLoader = null;
  };

  const updateOTPValue = (otpValue: string) => {
    if (debug) {
      console.log(`pendingModal-web updateOTPValue`, otpValue);
    }

    if (modalLoader) {
      modalLoader.updateOTPValue(otpValue);
    }
  };

  const mount = (
    {
      displayOTP,
    }: {
      displayOTP: boolean;
    } = {
      displayOTP: true,
    },
  ) => {
    if (debug) {
      console.log(`pendingModal-web mount`, div);
    }

    if (div) {
      div.style.display = 'block';
      return;
    }

    modalLoader = new ModalLoader({ debug, sdkVersion: packageJson.version });
    div = document.createElement('div');
    document.body.appendChild(div);

    modalLoader.renderPendingModal({
      i18nInstance,
      parentElement: div,
      onClose: unmount,
      onDisconnect,
      updateOTPValue,
      displayOTP,
    });
  };

  // Auto mount on initialization
  mount();

  return { mount, unmount, updateOTPValue };
};

export default sdkWebPendingModal;
