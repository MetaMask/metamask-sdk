import InstallModalWeb from '@metamask/sdk-install-modal-web';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

const InstallModal = ({ link }: { link: string }) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const installModal = new InstallModalWeb();

  const onClose = () => {
    installModal.unmount();
    document.body.removeChild(div);
  };

  installModal.mount({
    parentElement: div,
    link,
    MetaMaskInstaller,
    onClose,
  });

  return { installModal, onClose };
};

export default InstallModal;
