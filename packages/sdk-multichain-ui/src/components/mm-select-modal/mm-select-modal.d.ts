import { EventEmitter } from '@stencil/core';
export declare class SelectModal {
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
    connectWithExtension: EventEmitter;
    tab: number;
    isDefaultTab: boolean;
    el: HTMLElement;
    private translationsLoaded;
    constructor();
    connectedCallback(): Promise<void>;
    onClose(shouldTerminate?: boolean): void;
    connectWithExtensionHandler(): void;
    setTab(tab: number): void;
    disconnectedCallback(): void;
    updatePreferDesktop(newValue: boolean): void;
    render(): any;
}
//# sourceMappingURL=mm-select-modal.d.ts.map