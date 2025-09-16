import type { InstallWidgetProps, OTPCodeWidgetProps } from '../../domain';
import type { AbstractInstallModal } from './base/AbstractInstallModal';
import type { AbstractOTPCodeModal } from './base/AbstractOTPModal';

export type ModalTypes = 'InstallModal' | 'OTPCodeModal';
/**
 * Record type that maps modal names to their corresponding Modal instances.
 * Used to store different types of modals that can be created by the factory.
 */
export type FactoryModals = {
	InstallModal: new (options: InstallWidgetProps) => AbstractInstallModal;
	OTPCodeModal: new (options: OTPCodeWidgetProps) => AbstractOTPCodeModal;
};
