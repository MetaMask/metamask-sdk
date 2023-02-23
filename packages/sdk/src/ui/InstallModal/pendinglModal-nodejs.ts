// eslint-disable-next-line @typescript-eslint/default-param-last, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
const PendingModal = (onDisconnect = () => {}) => {
  console.log(
    `Please open the MetaMask wallet app and confirm the connection. Thank you!`,
  );

  return {
    onClose: () => {
      return false;
    },
    updateOTPValue: () => {
      return false;
    },
  };
};

export default PendingModal;
