import ManageMetaMaskInstallation from '../../Platform/ManageMetaMaskInstallation';
import InstallModalWeb from '@metamask/sdk-install-modal-web'

const InstallModal = ({ link }) => {
  
  const div = document.createElement('div');
  document.body.appendChild(div);

  var installModal = new InstallModalWeb();

  const onClose = () => {
    installModal.unmount()
    document.body.removeChild(div);
  }

  installModal.mount({
    parentElement: div,
    link,
    ManageMetaMaskInstallation,
    onClose
  });
  
  return {installModal, onClose}
};

export default InstallModal;
