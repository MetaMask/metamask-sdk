import * as t from 'vitest';
import { vi } from 'vitest';

import { AbstractInstallModal, AbstractPendingModal, type Modal } from '../../domain';
import * as RNModals from './';

t.describe('RN Modals', () => {
  let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;

  t.afterEach(() => {
    modal?.unmount();
  });

  t.it('Check Modal instances', () => {
    t.expect(RNModals.installModal).toBeInstanceOf(AbstractInstallModal);
    t.expect(RNModals.selectModal).toBeInstanceOf(AbstractInstallModal);
    t.expect(RNModals.pendingModal).toBeInstanceOf(AbstractPendingModal);
  });

  t.it('rendering InstallModal on RN', async () => {
    modal = await RNModals.installModal.render({
      link: 'https://example.com',
      sdkVersion: '1.0.0',
      preferDesktop: false,
      onClose: vi.fn(),
      onAnalyticsEvent: vi.fn(),
      metaMaskInstaller: {
        startDesktopOnboarding: vi.fn(),
      },
    });
    t.expect(modal).toBeDefined();
    t.expect(modal.unmount).toBeDefined();
    t.expect(modal.mount).toBeDefined();
    t.expect((modal as any).sync).not.toBeDefined();
    modal.mount();
  });

  t.it('Rendering PendingModal on RN', async () => {
    //TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
    modal = await RNModals.pendingModal.render({
      otpCode: '123456',
      onClose: vi.fn(),
      updateOTPValue: vi.fn(),
    });
    t.expect(modal).toBeDefined();
    t.expect(modal.unmount).toBeDefined();
    t.expect(modal.mount).toBeDefined();
    t.expect(modal.sync).toBeDefined();
    modal.mount();
  });

  t.it('Rendering SelectModal on RN', async () => {
    //TODO:selectModal  Modal is currently not doing much but will be a placeholder for the future 2fa modal
    modal = await RNModals.selectModal.render({
      link: 'https://example.com',
      sdkVersion: '1.0.0',
      preferDesktop: false,
      onClose: vi.fn(),
      connect: vi.fn(),
    });
    t.expect(modal).toBeDefined();
    t.expect(modal.unmount).toBeDefined();
    t.expect(modal.mount).toBeDefined();
    modal.mount();
  });
});
