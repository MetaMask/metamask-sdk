import { i18n } from 'i18next';
declare const sdkWebPendingModal: ({ onDisconnect, i18nInstance, debug, }: {
    onDisconnect?: (() => void) | undefined;
    i18nInstance: i18n;
    debug?: boolean | undefined;
}) => {
    mount: ({ displayOTP, }?: {
        displayOTP: boolean;
    }) => void;
    unmount: () => void;
    updateOTPValue: (otpValue: string) => void;
};
export default sdkWebPendingModal;
//# sourceMappingURL=pendingModal-web.d.ts.map