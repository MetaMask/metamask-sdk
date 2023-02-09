import SDKModalWeb from '@metamask/sdk-install-modal-web';

export const sdkWebPendingModal = () => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const modalWeb = new SDKModalWeb();

  const onClose = () => {
    modalWeb.unmount();
    document.body.removeChild(div);
  };

  modalWeb.mountPending({
    parentElement: div,
    onClose,
  });

  return { installModal: modalWeb, onClose };
};

export default sdkWebPendingModal;
