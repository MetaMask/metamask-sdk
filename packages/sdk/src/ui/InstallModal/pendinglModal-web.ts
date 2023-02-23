import SDKModalWeb from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = (onDisconnect: () => void) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  let modalWeb = new SDKModalWeb();

  const onClose = () => {
    if (modalWeb) {
      modalWeb.unmount();
      document.body.removeChild(div);
    }
    modalWeb = undefined;
  };

  const updateOTPValue = (otpValue: number) => {
    if (modalWeb) {
      modalWeb.updateOTPValue(otpValue);
    }
  };

  console.debug(`mounting pending modal`);
  modalWeb.mountPending({
    parentElement: div,
    onClose,
    onDisconnect,
    updateOTPValue,
  });

  return { installModal: modalWeb, onClose, updateOTPValue };
};

export default sdkWebPendingModal;
