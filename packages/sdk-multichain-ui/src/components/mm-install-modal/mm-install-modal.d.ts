import { EventEmitter } from '@stencil/core';
import { TrackingEvents } from '../misc/tracking-events';
export declare class InstallModal {
    /**
     * The QR code link
     */
    link: string;
    sdkVersion?: string;
    preferDesktop: boolean;
    private i18nInstance;
    close: EventEmitter<{
        shouldTerminate?: boolean;
    }>;
    startDesktopOnboarding: EventEmitter;
    trackAnalytics: EventEmitter<{
        event: TrackingEvents;
        params?: Record<string, unknown>;
    }>;
    tab: number;
    isDefaultTab: boolean;
    el: HTMLElement;
    private translationsLoaded;
    constructor();
    componentDidLoad(): void;
    connectedCallback(): Promise<void>;
    updatePreferDesktop(newValue: boolean): void;
    onClose(shouldTerminate?: boolean): void;
    onStartDesktopOnboardingHandler(): void;
    setTab(newTab: number, isUserAction?: boolean): void;
    render(): any;
}
//# sourceMappingURL=mm-install-modal.d.ts.map