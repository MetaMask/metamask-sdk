import SDKModalWeb from '@metamask/sdk-install-modal-web';

const sdkWebPendingModal = () => {
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

  console.debug(`mounting pending modal`);
  modalWeb.mountPending({
    parentElement: div,
    onClose,
  });

  return { installModal: modalWeb, onClose };
};

export default sdkWebPendingModal;
