import { ModalLoader } from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = (onDisconnect?: () => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  let mounted = false;

  const modalLoader = new ModalLoader();

  const unmount = () => {
    div.style.display = 'none';
  };

  const updateOTPValue = (otpValue: string) => {
    if (modalLoader) {
      modalLoader.updateOTPValue(otpValue);
    }
  };

  const mount = () => {
    if (mounted) {
      div.style.display = 'block';
      return;
    }

    modalLoader.renderPendingModal({
      parentElement: div,
      onClose: unmount,
      onDisconnect,
      updateOTPValue,
    });
    mounted = true;
  };

  // Auto mount on initialization
  mount();

  return { mount, unmount, updateOTPValue };
};

export default sdkWebPendingModal;
