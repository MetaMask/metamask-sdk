import { logger } from '../../utils/logger';

const PendingModal = () => {
  logger(
    `[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!`,
  );

  return {
    unmount: () => {
      return false;
    },
    updateOTPValue: (otpValue: string) => {
      if (otpValue !== '') {
        logger(
          `[UI: pendingModal-nodejs: PendingModal()] Choose the following value on your metamask mobile wallet: ${otpValue}`,
        );
      }
    },
    mount: () => {
      return false;
    },
  };
};

export default PendingModal;
