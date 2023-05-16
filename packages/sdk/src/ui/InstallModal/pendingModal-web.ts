import { ModalLoader } from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = (onDisconnect: () => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  let mounted = false;

  const modalLoader = new ModalLoader();

  const onClose = () => {
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
    } else {
      modalLoader.renderPendingModal({
        parentElement: div,
        onClose,
        onDisconnect,
        updateOTPValue,
      });
      mounted = true;
    }
  };

  // Auto mount on initialization
  mount();

  return { installModal: modalLoader, onClose, mount, updateOTPValue };
};

export default sdkWebPendingModal;
