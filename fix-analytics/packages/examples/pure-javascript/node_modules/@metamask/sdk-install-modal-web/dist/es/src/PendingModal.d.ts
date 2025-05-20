import { i18n } from 'i18next';
import React from 'react';
export interface PendingModalProps {
    onClose: () => void;
    onDisconnect?: () => void;
    sdkVersion?: string;
    updateOTPValue: (otpValue: string) => void;
    displayOTP?: boolean;
    i18nInstance: i18n;
}
export declare const PendingModal: (props: PendingModalProps) => React.JSX.Element;
//# sourceMappingURL=PendingModal.d.ts.map