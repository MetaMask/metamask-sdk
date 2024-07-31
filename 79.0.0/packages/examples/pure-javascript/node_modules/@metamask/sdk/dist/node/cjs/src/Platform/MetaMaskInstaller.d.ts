import { ProviderService } from '../services/ProviderService';
import { PlatformManager } from './PlatfformManager';
interface InstallerProps {
    preferDesktop: boolean;
    remote: ProviderService;
    platformManager: PlatformManager;
    debug?: boolean;
}
interface MetaMaskInstallerState {
    isInstalling: boolean;
    hasInstalled: boolean;
    resendRequest: any;
    preferDesktop: boolean;
    platformManager: PlatformManager | null;
    remote: ProviderService | null;
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
    start({ wait }: {
        wait: boolean;
    }): Promise<boolean>;
}
export {};
//# sourceMappingURL=MetaMaskInstaller.d.ts.map