import packageJson from '../../../package.json';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
import { logger } from '../../utils/logger';
import ModalLoader from './Modal-web';

const sdkWebInstallModal = ({
  link,
  debug,
  installer,
  terminate,
  connectWithExtension,
  preferDesktop,
}: {
  link: string;
  debug?: boolean;
  preferDesktop?: boolean;
  installer: MetaMaskInstaller;
  terminate?: () => void;
  connectWithExtension?: () => void;
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
      `[UI: InstallModal-web: sdkWebInstallModal()] installModal-web unmounting install modal -- shouldTerminate:`,
      shouldTerminate,
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

    console.warn(`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`);
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
        parentElement: div,
        preferDesktop: preferDesktop ?? false,
        link,
        metaMaskInstaller: installer,
        onClose: unmount,
      });
    }
  };

  return { mount, unmount };
};

export default sdkWebInstallModal;
