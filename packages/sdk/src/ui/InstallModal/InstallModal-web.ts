import { ModalLoader } from '@metamask/sdk-install-modal-web';

import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

const sdkWebInstallModal = ({
  link,
  debug,
}: {
  link: string;
  debug?: boolean;
}) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const modalLoader = new ModalLoader();

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
    if (modalLoader) {
      modalLoader.unmount();
    }
  };

  modalLoader.renderInstallModal({
    parentElement: div,
    link,
    metaMaskInstaller: MetaMaskInstaller.getInstance(),
    onClose,
  });

  return { installModal: modalLoader, onClose };
};

export default sdkWebInstallModal;
