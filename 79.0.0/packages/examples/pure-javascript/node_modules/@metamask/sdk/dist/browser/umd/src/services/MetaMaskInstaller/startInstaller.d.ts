import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
/**
 * Initiates the MetaMask installation process, optionally waiting for providers to establish a connection.
 *
 * The function first logs debug information if debugging is enabled. If the `wait` option is set to true,
 * it waits for a specified time (1 second by default) to allow providers to establish a connection.
 * After waiting or immediately (if `wait` is false), it proceeds to check for MetaMask installation.
 *
 * @param instance The MetaMaskInstaller instance responsible for checking MetaMask installation.
 * @param options An object containing a boolean `wait` property to indicate whether to wait for providers to establish a connection.
 * @returns Promise<boolean> Returns a promise that resolves to the result of `checkInstallation`, indicating whether MetaMask is installed.
 */
export declare function startInstaller(instance: MetaMaskInstaller, { wait }: {
    wait: boolean;
}): Promise<boolean>;
//# sourceMappingURL=startInstaller.d.ts.map