import { ModalLoader } from '@metamask/sdk-install-modal-web';

import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

const sdkWebInstallModal = ({
  link,
  debug,
  connectWithExtension,
}: {
  link: string;
  debug?: boolean;
  connectWithExtension?: () => void;
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

  if (window.extension) {
    // When extension is available, we allow switching between extension and mobile
    modalLoader.renderSelectModal({
      parentElement: div,
      connectWithExtension: () => {
        onClose();
        connectWithExtension?.();
      },
      onClose,
      link,
    });
  } else {
    modalLoader.renderInstallModal({
      parentElement: div,
      link,
      metaMaskInstaller: MetaMaskInstaller.getInstance(),
      onClose,
    });
  }

  return { installModal: modalLoader, onClose };
};

export default sdkWebInstallModal;
