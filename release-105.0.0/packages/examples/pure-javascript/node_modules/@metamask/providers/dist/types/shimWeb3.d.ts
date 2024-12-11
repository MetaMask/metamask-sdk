import type { MetaMaskInpageProvider } from './MetaMaskInpageProvider';
import type { ConsoleLike } from './utils';
/**
 * If no existing window.web3 is found, this function injects a web3 "shim" to
 * not break dapps that rely on window.web3.currentProvider.
 *
 * @param provider - The provider to set as window.web3.currentProvider.
 * @param log - The logging API to use.
 */
export declare function shimWeb3(provider: MetaMaskInpageProvider, log?: ConsoleLike): void;
//# sourceMappingURL=shimWeb3.d.ts.map