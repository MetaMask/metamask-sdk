/* #if _WEB
import InstallModal from './InstallModal-web';
//#elif _NODEJS
import InstallModal from './InstallModal-nodejs';
//#elif _REACTNATIVE
import InstallModal from './InstallModal-nonweb';
//#else */
// import InstallModal from './InstallModal-nodejs';
// import InstallModal from './InstallModal-nonweb';
import InstallModal from './InstallModal-web';
// #endif

export default InstallModal;
