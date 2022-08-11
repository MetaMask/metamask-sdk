/* #if _WEB
import setupProviderStreams from './setupProviderStreams-web';
//#else */
import setupProviderStreams from './setupProviderStreams-nonweb';
// #endif

export default setupProviderStreams;
