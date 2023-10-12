import { ModalLoader } from '@metamask/sdk-install-modal-web';

import { i18n } from 'i18next';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';

const sdkWebInstallModal = ({
  link,
  debug,
  installer,
  terminate,
  connectWithExtension,
  i18nInstance,
}: {
  link: string;
  debug?: boolean;
  installer: MetaMaskInstaller;
  terminate?: () => void;
  connectWithExtension?: () => void;
  i18nInstance: i18n;
}) => {
  let modalLoader: ModalLoader | null = null;
  let div: HTMLDivElement | null = null;

  if (debug) {
    console.debug(`################## Installing Modal #################`);
    console.debug(`${link}`);
    console.debug(`npx uri-scheme open ${link} --ios`);
    console.debug(`npx uri-scheme open ${link} --android`);
    console.debug(
      `adb shell am start -a android.intent.action.VIEW -d "${link}"`,
    );
  }

  const unmount = (shouldTerminate?: boolean) => {
    if (debug) {
      console.info('installModal-web unmounting install modal', div);
    }

    // Remove the node from the DOM
    if (div?.parentNode) {
      div.parentNode?.removeChild(div);
    }
    div = null;
    modalLoader = null;
    if (shouldTerminate === true) {
      terminate?.();
    }
  };

  const mount = (qrcodeLink: string) => {
    if (debug) {
      console.info('installModal-web mounting install modal', div);
    }

    if (div) {
      div.style.display = 'block';
      modalLoader?.updateQRCode(qrcodeLink);
      return;
    }

    modalLoader = new ModalLoader(debug);
    div = document.createElement('div');
    document.body.appendChild(div);
    if (window.extension) {
      // When extension is available, we allow switching between extension and mobile
      modalLoader.renderSelectModal({
        i18nInstance,
        parentElement: div,
        connectWithExtension: () => {
          unmount();
          connectWithExtension?.();
        },
        onClose: unmount,
        link,
      });
    } else {
      modalLoader.renderInstallModal({
        i18nInstance,
        parentElement: div,
        link,
        metaMaskInstaller: installer,
        onClose: unmount,
      });
    }
  };

  return { mount, unmount };
};

export default sdkWebInstallModal;
