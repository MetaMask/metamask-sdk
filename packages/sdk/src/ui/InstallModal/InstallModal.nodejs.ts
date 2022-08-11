const qrcode = require('qrcode-terminal');

const InstallModal = ({ link }) => {
  qrcode.generate(link, { small: true }, (qr) => console.log(qr));
};

export default InstallModal;
