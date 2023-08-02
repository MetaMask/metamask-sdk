const InstallModal = ({ link }: { link: string; debug?: boolean }) => {
  console.log('INSTALL MODAL', link);
  return {
    unmount: () => undefined,
  };
};
export default InstallModal;
