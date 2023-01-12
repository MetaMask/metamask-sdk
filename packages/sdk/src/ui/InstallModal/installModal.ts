/* #if _WEB
import InstallModal from './InstallModal-web';
//#elif _NODEJS
import InstallModal from './InstallModal-nodejs';
//#else */
import InstallModal from './InstallModal-nodejs';
// import InstallModal from './InstallModal-nonweb';
// #endif

export default InstallModal;
