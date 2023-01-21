// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const qrcode = require('qrcode-terminal');

const InstallModal = ({ link, debug }: { link: string; debug?: boolean }) => {
  qrcode.generate(link, { small: true }, (qr: unknown) => console.log(qr));
  if (debug) {
    console.log(`url for qrcode: `, link);
  }
};

export default InstallModal;
