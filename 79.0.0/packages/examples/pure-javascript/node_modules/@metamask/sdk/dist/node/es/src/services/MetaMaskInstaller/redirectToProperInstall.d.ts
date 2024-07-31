import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
/**
 * Redirects the user to the appropriate MetaMask installation method based on the platform type.
 *
 * The function determines the platform type using the platformManager of the provided MetaMaskInstaller state.
 * If the platform is a MetaMask Mobile Webview, the function returns false, as no installation is needed.
 * For desktop web platforms, the function initiates the desktop onboarding process if `preferDesktop` is true.
 * If none of these conditions are met, it initiates a remote connection for MetaMask installation.
 *
 * @param instance The MetaMaskInstaller instance used to determine platform type and initiate appropriate installation methods.
 * @returns Promise<boolean> Returns a promise that resolves to true if installation or remote connection is successful, and false otherwise.
 * @throws Throws an error if the remote startConnection fails.
 */
export declare function redirectToProperInstall(instance: MetaMaskInstaller): Promise<boolean>;
//# sourceMappingURL=redirectToProperInstall.d.ts.map