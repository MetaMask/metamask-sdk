export declare class WakeLockManager {
    enabled: boolean;
    _wakeLock?: any;
    noSleepTimer?: number | ReturnType<typeof setInterval>;
    noSleepVideo?: HTMLVideoElement;
    _eventsAdded: boolean;
    debug: boolean;
    constructor(debug?: boolean);
    start(): void;
    _addSourceToVideo(element: HTMLVideoElement, type: string, dataURI: string): void;
    isEnabled(): boolean;
    setDebug(debug: boolean): void;
    enable(): Promise<boolean>;
    disable(_context?: string): void;
}
//# sourceMappingURL=WakeLockManager.d.ts.map