import { RemoteCommunication } from '../../../RemoteCommunication';
/**
 * Resumes the communication of a previously paused `RemoteCommunication` instance.
 * This function primarily instructs the underlying communication layer to resume its activities. After resuming, the connection status of the instance is set to 'LINKED'.
 * Debug logs are generated if the debug state is enabled, indicating the current channel being resumed.
 *
 * @param instance The current instance of the RemoteCommunication class.
 */
export declare function resume(instance: RemoteCommunication): void;
//# sourceMappingURL=resume.d.ts.map