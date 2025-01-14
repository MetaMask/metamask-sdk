import { RemoteConnection } from '../services/RemoteConnection';
import { PlatformManager } from './PlatfformManager';
interface InstallerProps {
    preferDesktop: boolean;
    remote: RemoteConnection;
    platformManager: PlatformManager;
    debug?: boolean;
}
export interface RPCCall {
    method: string;
    params: unknown;
    id: string;
}
interface MetaMaskInstallerState {
    isInstalling: boolean;
    hasInstalled: boolean;
    resendRequest: any;
    preferDesktop: boolean;
    platformManager: PlatformManager | null;
    connectWith?: RPCCall;
    remote: RemoteConnection | null;
    debug: boolean;
}
/**
 * Singleton class instance
 */
export declare class MetaMaskInstaller {
    private static instance;
    state: MetaMaskInstallerState;
    constructor({ remote, preferDesktop, platformManager, debug, }: InstallerProps);
    startDesktopOnboarding(): Promise<void>;
    redirectToProperInstall(): Promise<boolean>;
    checkInstallation(): Promise<boolean>;
    start({ wait, connectWith, }: {
        wait: boolean;
        connectWith?: RPCCall;
    }): Promise<void>;
}
export {};
//# sourceMappingURL=MetaMaskInstaller.d.ts.map