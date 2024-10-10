import { i18n } from 'i18next';
import React from 'react';
export interface InstallModalProps {
    onClose: () => void;
    link: string;
    sdkVersion?: string;
    preferDesktop: boolean;
    metaMaskInstaller: {
        startDesktopOnboarding: () => void;
    };
    i18nInstance: i18n;
}
export declare const InstallModal: (props: InstallModalProps) => React.JSX.Element;
//# sourceMappingURL=InstallModal.d.ts.map