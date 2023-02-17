const PendingModal = () => {
  console.log(
    `Please open the MetaMask wallet app and confirm the connection. Thank you!`,
  );

  return {
    onClose: () => {
      return false;
    },
  };
};

export default PendingModal;
