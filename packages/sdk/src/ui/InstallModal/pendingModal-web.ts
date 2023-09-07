import { ModalLoader } from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = ({
  debug,
  onDisconnect,
}: {
  debug?: boolean;
  onDisconnect?: () => void;
}) => {
  let div: HTMLDivElement | null = null;
  let modalLoader: ModalLoader | null = null;

  const unmount = () => {
    if (debug) {
      console.log(`pendingModal-web unmount`, div);
    }

    if (div) {
      div.style.display = 'none';
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

  const mount = () => {
    if (debug) {
      console.log(`pendingModal-web mount`, div);
    }

    if (div) {
      div.style.display = 'block';
      return;
    }

    modalLoader = new ModalLoader();
    div = document.createElement('div');
    document.body.appendChild(div);

    modalLoader.renderPendingModal({
      parentElement: div,
      onClose: unmount,
      onDisconnect,
      updateOTPValue,
    });
  };

  // Auto mount on initialization
  mount();

  return { mount, unmount, updateOTPValue };
};

export default sdkWebPendingModal;
