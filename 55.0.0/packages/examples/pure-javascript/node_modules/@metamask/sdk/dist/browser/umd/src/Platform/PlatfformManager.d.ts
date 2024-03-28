/// <reference types="node" />
import { PlatformType } from '@metamask/sdk-communication-layer';
import { WakeLockStatus } from '../types/WakeLockStatus';
import { WakeLockManager } from './WakeLockManager';
export declare const TEMPORARY_WAKE_LOCK_TIME = 2000;
export declare const UNTIL_RESPONSE_WAKE_LOCK_TIME = 40000;
export declare const LINK_OPEN_DELAY = 500;
interface PlatformProps {
    useDeepLink: boolean;
    preferredOpenLink?: (link: string, target?: string) => void;
    wakeLockStatus?: WakeLockStatus;
    debug?: boolean;
}
interface PlatformManagerState {
    wakeLock: WakeLockManager;
    wakeLockStatus: WakeLockStatus;
    wakeLockTimer?: NodeJS.Timeout;
    wakeLockFeatureActive: boolean;
    platformType?: PlatformType;
    useDeeplink: boolean;
    preferredOpenLink?: (link: string, target?: string) => void;
    debug: boolean;
}
export declare class PlatformManager {
    state: PlatformManagerState;
    constructor({ useDeepLink, preferredOpenLink, wakeLockStatus, debug, }: PlatformProps);
    enableWakeLock(): void;
    disableWakeLock(): void;
    openDeeplink(universalLink: string, deeplink: string, target?: string): void;
    isReactNative(): boolean;
    isMetaMaskInstalled(): boolean;
    isDesktopWeb(): boolean;
    isMobile(): boolean;
    isSecure(): boolean;
    isMetaMaskMobileWebView(): boolean;
    isMobileWeb(): boolean;
    isNotBrowser(): boolean;
    isNodeJS(): boolean;
    isBrowser(): boolean;
    isUseDeepLink(): boolean;
    getPlatformType(): PlatformType;
}
export {};
//# sourceMappingURL=PlatfformManager.d.ts.map