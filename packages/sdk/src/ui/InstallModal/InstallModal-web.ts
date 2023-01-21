import InstallModalWeb from '@metamask/sdk-install-modal-web';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

const InstallModal = ({ link, debug }: { link: string; debug?: boolean }) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const installModal = new InstallModalWeb();

  if (debug) {
    console.debug(`################## Installing Modal #################`);
    console.debug(`${link}`);
    console.debug(`npx uri-scheme open ${link} --ios`);
    console.debug(`npx uri-scheme open ${link} --android`);
    console.debug(
      `adb shell am start -a android.intent.action.VIEW -d "${link}"`,
    );
  }

  const onClose = () => {
    installModal.unmount();
    document.body.removeChild(div);
  };

  installModal.mount({
    parentElement: div,
    link,
    metaMaskInstaller: MetaMaskInstaller.getInstance(),
    onClose,
  });

  return { installModal, onClose };
};

export default InstallModal;
