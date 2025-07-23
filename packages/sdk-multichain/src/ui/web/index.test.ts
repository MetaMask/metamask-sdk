import * as t from 'vitest';
import { vi } from 'vitest';
import { JSDOM as Page } from 'jsdom';

import { AbstractInstallModal, AbstractPendingModal, type Modal } from '../../domain';
import * as WebModals from './';

t.describe('WEB Modals', () => {
  let modal: Awaited<ReturnType<Modal<any>['render']>> | undefined;

  t.beforeAll(() => {
    const dom = new Page("<!DOCTYPE html><div id='root'></div>", {
      url: 'https://dapp.io/',
    });
    const globalStub = {
      ...dom.window,
      addEventListener: t.vi.fn(),
      removeEventListener: t.vi.fn(),
      localStorage: t.vi.fn(),
    };
    t.vi.stubGlobal('navigator', {
      ...dom.window.navigator,
      product: 'Chrome',
    });
    t.vi.stubGlobal('window', globalStub);
    t.vi.stubGlobal('location', dom.window.location);
    t.vi.stubGlobal('document', dom.window.document);
  });

  t.afterEach(() => {
    modal?.unmount();
  });

  t.it('Check Modal instances', () => {
    t.expect(WebModals.installModal).toBeInstanceOf(AbstractInstallModal);
    t.expect(WebModals.selectModal).toBeInstanceOf(AbstractInstallModal);
    t.expect(WebModals.pendingModal).toBeInstanceOf(AbstractPendingModal);
  });

  t.it('rendering InstallModal on Web', async () => {
    modal = await WebModals.installModal.render({
      parentElement: document.getElementById('root')!,
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

  t.it('Rendering PendingModal on Web', async () => {
    //TODO: Modal is currently not doing much but will be a placeholder for the future 2fa modal
    modal = await WebModals.pendingModal.render({
      parentElement: document.getElementById('root')!,
      otpCode: '123456',
      onClose: vi.fn(),
      updateOTPValue: vi.fn(),
      onDisconnect: vi.fn(),
    });
    t.expect(modal).toBeDefined();
    t.expect(modal.unmount).toBeDefined();
    t.expect(modal.mount).toBeDefined();
    t.expect(modal.sync).toBeDefined();
    modal.mount();
  });

  t.it('Rendering SelectModal on Web', async () => {
    //TODO:selectModal  Modal is currently not doing much but will be a placeholder for the future 2fa modal
    modal = await WebModals.selectModal.render({
      parentElement: document.getElementById('root')!,
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
