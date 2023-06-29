// eslint-disable-next-line @typescript-eslint/default-param-last, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
const PendingModal = () => {
  console.log(
    `Please open the MetaMask wallet app and confirm the connection. Thank you!`,
  );

  return {
    onClose: () => {
      return false;
    },
    updateOTPValue: (otpValue: string) => {
      if (otpValue !== '') {
        console.info(
          `Choose the following value on your metamask mobile wallet: ${otpValue}`,
        );
      }
    },
    mount: () => {
      return false;
    },
  };
};

export default PendingModal;
