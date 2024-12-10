import { InstallModalProps } from './InstallModal';
import { PendingModalProps } from './PendingModal';
import { SelectModalProps } from './SelectModal';
export interface InstallWidgetProps extends InstallModalProps {
    parentElement: Element;
}
export interface PendingWidgetProps extends PendingModalProps {
    parentElement: Element;
}
export interface SelectWidgetProps extends SelectModalProps {
    parentElement: Element;
}
export declare class ModalLoader {
    private installContainer?;
    private pendingContainer?;
    private selectContainer?;
    private debug;
    private sdkVersion?;
    constructor({ debug, sdkVersion }: {
        debug?: boolean;
        sdkVersion?: string;
    });
    renderInstallModal(props: InstallWidgetProps): void;
    renderSelectModal(props: SelectWidgetProps): void;
    renderPendingModal(props: PendingWidgetProps): void;
    updateOTPValue: (otpValue: string) => void;
    updateQRCode: (link: string) => void;
    unmount(): void;
}
//# sourceMappingURL=ModalLoader.d.ts.map