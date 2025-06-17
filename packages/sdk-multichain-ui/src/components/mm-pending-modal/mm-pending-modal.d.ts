import { EventEmitter } from '@stencil/core';
export declare class PendingModal {
    /**
     * The QR code link
     */
    displayOTP?: boolean;
    sdkVersion?: string;
    private i18nInstance;
    otpCode?: string;
    close: EventEmitter;
    disconnect: EventEmitter;
    updateOTPValue: EventEmitter<{
        otpValue: string;
    }>;
    el: HTMLElement;
    private translationsLoaded;
    constructor();
    connectedCallback(): Promise<void>;
    onClose(): void;
    onDisconnect(): void;
    onUpdateOTPValueHandler(otpValue: string): void;
    disconnectedCallback(): void;
    render(): any;
}
//# sourceMappingURL=mm-pending-modal.d.ts.map