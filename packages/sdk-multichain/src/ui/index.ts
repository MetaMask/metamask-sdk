import MetaMaskOnboarding from '@metamask/onboarding';
import { getPlatformType, getVersion, type InstallWidgetProps, ModalFactory, type OTPCodeWidgetProps, PlatformType, type RenderedModal } from '../domain';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';

// @ts-ignore
let __instance: typeof import('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js') | undefined;

/**
 * Preload install modal custom elements only once
 */
export async function preload() {
	// @ts-ignore
	__instance ??= await import('@metamask/sdk-multichain-ui/dist/loader/index.cjs.js')
		.then((loader) => {
			loader.defineCustomElements();
			return Promise.resolve(loader);
		})
		.catch((error) => {
			console.error(`Gracefully Failed to load modal customElements:`, error);
			return Promise.resolve(undefined);
		});
}

export class UIModule extends ModalFactory {
	private modal!: RenderedModal;
	private readonly platform: PlatformType = getPlatformType();
	private successCallback!: (success: boolean, error?: Error) => void;

	unload(success: boolean, error?: Error) {
		this.modal?.unmount(success, error);
		this.successCallback?.(success, error);
	}

	/**
	 * Determines if the current platform is a mobile native environment.
	 * Currently only includes React Native.
	 */
	get isMobile() {
		return this.platform === PlatformType.ReactNative;
	}

	/**
	 * Determines if the current platform is a Node.js environment.
	 * Used for server-side or non-browser environments.
	 */
	get isNode() {
		return this.platform === PlatformType.NonBrowser;
	}

	/**
	 * Determines if the current platform is a web environment.
	 * Includes desktop web, MetaMask mobile webview, and mobile web.
	 */
	get isWeb() {
		return this.platform === PlatformType.DesktopWeb || this.platform === PlatformType.MetaMaskMobileWebview || this.platform === PlatformType.MobileWeb;
	}

	private getContainer() {
		return typeof document === 'undefined' ? undefined : document.createElement('div');
	}

	private getMountedContainer() {
		if (typeof document === 'undefined') {
			return undefined;
		}
		const container = this.getContainer();
		if (container) {
			document.body.appendChild(container);
		}
		return container;
	}

	public async renderInstallModal(preferDesktop: boolean, createSessionRequest: () => Promise<SessionRequest>, successCallback: (success: boolean, error?: Error) => void) {
		await preload();

		this.successCallback = successCallback;

		const container = this.getMountedContainer();
		const sessionRequest = await createSessionRequest();
		const modalProps: InstallWidgetProps = {
			onClose: () => {
				this.unload(true);
			},
			startDesktopOnboarding: () => {
				new MetaMaskOnboarding().startOnboarding();
				this.unload(true);
			},
			parentElement: container,
			sessionRequest,
			preferDesktop,
			sdkVersion: getVersion(),
			createSessionRequest,
		};
		this.modal = await this.options.installModal.render(modalProps);
		this.modal.mount();
	}

	public async renderOTPCodeModal() {
		await preload();
		// biome-ignore lint/suspicious/noExplicitAny: Temporary workaround until modal is implemented
		const modalProps: OTPCodeWidgetProps = {} as any;
		this.modal = await this.options.otpCodeModal.render(modalProps);
		this.modal.mount();
	}
}
