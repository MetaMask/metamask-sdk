// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const qrcode = require('qrcode-terminal');

const InstallModal = ({ link }: { link: string }) => {
  qrcode.generate(link, { small: true }, (qr: unknown) => console.log(qr));
};

export default InstallModal;
