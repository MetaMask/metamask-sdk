import { logger } from '../../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const qrcode = require('qrcode-terminal-nooctal');

const InstallModal = ({ link }: { link: string; debug?: boolean }) => {
  qrcode.generate(link, { small: true }, (qr: unknown) => console.log(qr));
  logger(`[UI: InstallModal-nodejs()] qrcode url: ${link}`);
  return {
    unmount: () => undefined,
  };
};

export default InstallModal;
