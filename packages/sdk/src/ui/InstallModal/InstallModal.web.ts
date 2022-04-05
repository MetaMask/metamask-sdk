import { AwesomeQR } from 'awesome-qr';
import ManageMetaMaskInstallation from '../../Platform/ManageMetaMaskInstallation';

const InstallModal = ({ link }) => {
  const div = document.createElement('div');
  div.innerHTML = `<div id="modal" style="display:none; position: fixed; left: 50%; transform: translate(-50%, -50%); z-index: 99999; background: #fff; padding: 20px; border-radius: 5px; font-family: sans-serif; top: 50%;">
        <h2>Install MetaMask Extension</h2>
        <a id="install-extension" style="background: rgb(3, 125, 214); cursor: pointer; text-align: center; transition: all 300ms ease 0s; color: rgb(255, 255, 255); min-height: 52px; display: inline-flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; padding: 8px 20px; border-radius: 999px; font-size: 16px; line-height: 1.3;">
          Install MetaMask Extension
        </a>
        <h2>Or scan with MetaMask Mobile</h2>
        <span>Open your MetaMask Mobile on your phone and scan</span>
        <div id="qr"/>
    </div>`;
  document.body.appendChild(div);

  const fader = document.createElement('div');

  fader.innerHTML = `<div id="fader" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; z-index: 99998; background: rgba(0,0,0,0.6);">
    </div>`;
  document.body.appendChild(fader);

  function showModalWindow() {
    document.getElementById('fader').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
  }
  function hideAllModalWindows() {
    const modalFader = document.getElementById('fader');
    const modalWindow = document.getElementById('modal');

    modalFader.style.display = 'none';

    modalWindow.style.display = 'none';
  }

  const qr = document.getElementById('qr');

  new AwesomeQR({
    text: link,
    size: 500,
  })
    .draw()
    .then((dataURL) => {
      const img = document.createElement('img');
      // @ts-ignore
      img.src = dataURL;
      img.width = 200;
      img.height = 200;
      qr.appendChild(img);
    });

  showModalWindow();

  document.getElementById('fader').addEventListener('click', function () {
    hideAllModalWindows();
  });

  document.getElementById('install-extension').addEventListener('click', () => {
    hideAllModalWindows();
    ManageMetaMaskInstallation.startDesktopOnboarding();
  });
};

export default InstallModal;
