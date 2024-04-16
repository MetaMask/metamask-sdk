import { ModalLoader } from '@metamask/sdk-install-modal-web';

import { i18n } from 'i18next';
import { logger } from '../../utils/logger';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import packageJson from '../../../package.json';

const sdkWebInstallModal = ({
  link,
  debug,
  installer,
  terminate,
  connectWithExtension,
  preferDesktop,
  i18nInstance,
}: {
  link: string;
  debug?: boolean;
  preferDesktop?: boolean;
  installer: MetaMaskInstaller;
  terminate?: () => void;
  connectWithExtension?: () => void;
  i18nInstance: i18n;
}) => {
  let modalLoader: ModalLoader | null = null;
  let div: HTMLDivElement | null = null;

  logger(
    `[UI: InstallModal-web: sdkWebInstallModal()] ################## Installing Modal #################`,
  );
  logger(`[UI: InstallModal-web: sdkWebInstallModal()] link=${link}`);
  logger(
    `[UI: InstallModal-web: sdkWebInstallModal()] npx uri-scheme open "${link}" --ios`,
  );

  logger(
    `[UI: InstallModal-web: sdkWebInstallModal()] npx uri-scheme open "${link}" --android`,
  );

  logger(
    `[UI: InstallModal-web: sdkWebInstallModal()] adb shell am start -a android.intent.action.VIEW -d "${link}"`,
  );

  const unmount = (shouldTerminate?: boolean) => {
    logger(
      `[UI: InstallModal-web: sdkWebInstallModal()] installModal-web unmounting install modal -- shouldTerminate=${shouldTerminate}`,
      div,
    );

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
    logger(
      '[UI: InstallModal-web: sdkWebInstallModal()] installModal-web mounting install modal',
      div,
    );

    if (div) {
      div.style.display = 'block';
      modalLoader?.updateQRCode(qrcodeLink);
      return;
    }

    modalLoader = new ModalLoader({ debug, sdkVersion: packageJson.version });
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
        preferDesktop: preferDesktop || false,
        link,
        metaMaskInstaller: installer,
        onClose: unmount,
      });
    }
  };

  return { mount, unmount };
};

export default sdkWebInstallModal;
