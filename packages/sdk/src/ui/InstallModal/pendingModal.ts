/* #if _WEB
import PendingModal from './pendingModal-web';
//#elif _NODEJS
import PendingModal from './pendingModal-nodejs';
//#elif _REACTNATIVE
import PendingModal from './pendingModal-nodejs';
//#else */
// This is ONLY used during development with devnext/devreactnative or via transpiling
// import PendingModal from './pendingModal-nodejs';
import PendingModal from './pendingModal-web';
// #endif

export default PendingModal;
