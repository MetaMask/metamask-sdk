import { TrackingEvent } from '@metamask/sdk-types';
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
  onAnalyticsEvent,
}: {
  link: string;
  debug?: boolean;
  preferDesktop?: boolean;
  installer: MetaMaskInstaller;
  terminate?: () => void;
  connectWithExtension?: () => void;
  onAnalyticsEvent: ({
    event,
    params,
  }: {
    event: TrackingEvent;
    params?: Record<string, unknown>;
  }) => void;
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
      modalLoader
        .renderSelectModal({
          parentElement: div,
          connectWithExtension: () => {
            unmount();
            connectWithExtension?.();
          },
          onClose: unmount,
          link,
          preferDesktop: preferDesktop ?? false,
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      modalLoader
        .renderInstallModal({
          parentElement: div,
          preferDesktop: preferDesktop ?? false,
          link,
          metaMaskInstaller: installer,
          onClose: unmount,
          onAnalyticsEvent,
        })
        .catch((err) => {
          console.error(`[UI: InstallModal-web: sdkWebInstallModal()]`, err);
        });
    }
  };

  return { mount, unmount };
};

export default sdkWebInstallModal;
