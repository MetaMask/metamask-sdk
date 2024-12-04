import { MetaMaskSDK } from '../../../sdk';
/**
 * Resumes the MetaMaskSDK's remote connection if it is not already ready.
 *
 * This function checks if the remote connection's connector is ready to transmit data. If not,
 * it initiates the connection. This is useful in scenarios where the SDK might have gone to a
 * 'sleep' state and needs to be 'awakened' to re-establish the connection.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @returns {Promise<void>} A Promise that resolves when the connection has been started or is already ready.
 */
export declare function resume(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=resume.d.ts.map