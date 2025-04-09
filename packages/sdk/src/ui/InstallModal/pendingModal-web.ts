import packageJson from '../../../package.json';
import { logger } from '../../utils/logger';
import ModalLoader from './Modal-web';

const sdkWebPendingModal = ({
  onDisconnect,
  debug,
}: {
  onDisconnect?: () => void;
  debug?: boolean;
}) => {
  let div: HTMLDivElement | null = null;
  let modalLoader: ModalLoader | null = null;

  const unmount = () => {
    logger(
      `[UI: pendingModal-web: sdkWebPendingModal()] pendingModal-web unmount`,
      div,
    );

    // Remove the node from the DOM
    if (div?.parentNode) {
      div.parentNode.removeChild(div);
    }

    div = null;
    modalLoader = null;
  };

  const updateOTPValue = (otpValue: string) => {
    logger(
      `[UI: pendingModal-web: sdkWebPendingModal()] pendingModal-web updateOTPValue`,
      otpValue,
    );

    if (modalLoader) {
      modalLoader.updateOTPValue(otpValue);
    }
  };

  const mount = (
    {
      displayOTP,
    }: {
      displayOTP: boolean;
    } = {
      displayOTP: true,
    },
  ) => {
    logger(
      `[UI: pendingModal-web: sdkWebPendingModal()] pendingModal-web mount`,
      div,
    );

    if (div) {
      div.style.display = 'block';
      return;
    }

    modalLoader = new ModalLoader({ debug, sdkVersion: packageJson.version });
    div = document.createElement('div');
    document.body.appendChild(div);

    modalLoader
      .renderPendingModal({
        parentElement: div,
        onClose: unmount,
        onDisconnect,
        updateOTPValue,
        displayOTP,
      })
      .catch((err) => {
        console.error(`[UI: pendingModal-web: sdkWebPendingModal()]`, err);
      });
  };

  // Auto mount on initialization
  mount();

  return { mount, unmount, updateOTPValue };
};

export default sdkWebPendingModal;
