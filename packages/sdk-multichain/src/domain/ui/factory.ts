import type { MultichainOptions, Scope, SessionData } from '../multichain';
import type { Modal } from './types';
import type { CaipAccountId } from '@metamask/utils';
import type { Transport } from '@metamask/multichain-api-client';

export type ModalTypes = 'installModal' | 'selectModal' | 'pendingModal';
/**
 * Record type that maps modal names to their corresponding Modal instances.
 * Used to store different types of modals that can be created by the factory.
 */
export type FactoryModals = Record<ModalTypes, Modal<any>>;

/**
 * Options passed when establishing a connection through a modal.
 * Contains the scopes (permissions) and account IDs involved in the connection.
 */
export type ModalFactoryConnectOptions = {
  scopes: Scope[];
  caipAccountIds: CaipAccountId[];
};

/**
 * Configuration options for the modal factory.
 * Combines mobile settings from SDK options with UI preferences and connection handling.
 */
export type ModalFactoryOptions = Pick<MultichainOptions, 'mobile' | 'transport'> & {
  ui: {
    headless?: boolean; // Whether to run without UI
    preferExtension?: boolean; // Whether to prefer browser extension
    preferDesktop?: boolean; // Whether to prefer desktop wallet
  };
  onConnection: (transport: Transport, options: ModalFactoryConnectOptions) => Promise<void>;
  getCurrentSession: () => Promise<SessionData | undefined>;
  connection?: ModalFactoryConnectOptions;
};

/**
 * Abstract base class for creating and managing modals across different platforms.
 * Provides platform detection and common functionality for modal management.
 *
 * @template T - Type of modals this factory can create, defaults to FactoryModals
 */
export abstract class ModalFactory<T extends FactoryModals = FactoryModals> {
  abstract renderInstallModal(link: string, preferDesktop: boolean): Promise<void>;
  abstract renderSelectModal(link: string, preferDesktop: boolean, connect: () => Promise<void>): Promise<void>;
  abstract renderPendingModal(): Promise<void>;
  /**
   * Creates a new modal factory instance.
   * @param options - The modals configuration object
   */
  constructor(protected readonly options: T) {
    this.validateModals();
  }

  private validateModals() {
    const requiredModals = ['installModal', 'selectModal', 'pendingModal'];
    const missingModals = requiredModals.filter((modal) => !this.options[modal as ModalTypes]);
    if (missingModals.length > 0) {
      throw new Error(`Missing required modals: ${missingModals.join(', ')}`);
    }
  }
}
