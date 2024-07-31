import { i18n } from 'i18next';
import React from 'react';
export interface SelectModalProps {
    onClose: (shouldTerminate?: boolean) => void;
    link: string;
    sdkVersion?: string;
    connectWithExtension: () => void;
    i18nInstance: i18n;
}
export declare const SelectModal: (props: SelectModalProps) => React.JSX.Element;
//# sourceMappingURL=SelectModal.d.ts.map