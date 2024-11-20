import encodeQR from '@paulmillr/qr';
import { logger } from '../../utils/logger';

const InstallModal = ({ link }: { link: string; debug?: boolean }) => {
  const qr = encodeQR(link, 'ascii');
  console.log(qr);
  logger(`[UI: InstallModal-nodejs()] qrcode url: ${link}`);
  return {
    unmount: () => undefined,
  };
};

export default InstallModal;
