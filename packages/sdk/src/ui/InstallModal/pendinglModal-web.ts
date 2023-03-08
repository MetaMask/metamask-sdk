import SDKModalWeb from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = (onDisconnect: () => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  let mounted = false;

  const modalWeb = new SDKModalWeb();

  const onClose = () => {
    // if (modalWeb) {
    // modalWeb.unmount();
    // document.body.removeChild(div);
    // }
    // modalWeb = undefined;
    // mounted = false;
    div.style.display = 'none';
  };

  const updateOTPValue = (otpValue: number) => {
    if (modalWeb) {
      modalWeb.updateOTPValue(otpValue);
    }
  };

  const mount = () => {
    if (mounted) {
      div.style.display = 'block';
    } else {
      modalWeb.mountPending({
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

  return { installModal: modalWeb, onClose, mount, updateOTPValue };
};

export default sdkWebPendingModal;
