import { logger } from '../../utils/logger';

const InstallModal = ({ link }: { link: string; debug?: boolean }) => {
  logger(`[UI: InstallModal-nonweb()] INSTALL MODAL link=${link}`);
  return {
    unmount: () => undefined,
  };
};
export default InstallModal;
