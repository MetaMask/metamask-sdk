import MetaMaskOnboarding from '@metamask/onboarding';
import { getPlatformType, getVersion, type InstallWidgetProps, type Modal, type OTPCode, type OTPCodeWidgetProps, PlatformType } from '../domain';
import type { SessionRequest } from '@metamask/mobile-wallet-protocol-core';
import type { FactoryModals, ModalTypes } from './modals/types';

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

export class ModalFactory<T extends FactoryModals = FactoryModals> {
	public modal!: Modal;
	private readonly platform: PlatformType = getPlatformType();
	private successCallback!: (success: boolean, error?: Error) => void;

	/**
	 * Creates a new modal factory instance.
	 * @param options - The modals configuration object
	 */
	constructor(protected readonly options: T) {
		this.validateModals();
	}

	private validateModals() {
		const requiredModals = ['InstallModal', 'OTPCodeModal'];
		const missingModals = requiredModals.filter((modal) => !this.options[modal as ModalTypes]);
		if (missingModals.length > 0) {
			throw new Error(`Missing required modals: ${missingModals.join(', ')}`);
		}
	}

	unload(success: boolean, error?: Error) {
		this.modal?.unmount();
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

	public async renderInstallModal(
		preferDesktop: boolean,
		createSessionRequest: () => Promise<SessionRequest>,
		successCallback: (success: boolean, error?: Error) => void,
		updateSessionRequest: (sessionRequest: SessionRequest) => void,
	) {
		this.modal?.unmount();
		await preload();
		this.successCallback = successCallback;

		const parentElement = this.getMountedContainer();
		const sessionRequest = await createSessionRequest();

		const modalProps: InstallWidgetProps = {
			parentElement,
			preferDesktop,
			sessionRequest,
			sdkVersion: getVersion(),
			onClose: () => {
				this.unload(true);
			},
			startDesktopOnboarding: () => {
				new MetaMaskOnboarding().startOnboarding();
				this.unload(true);
			},
			createSessionRequest,
			updateSessionRequest,
		};
		const modal = new this.options.InstallModal(modalProps);
		this.modal = modal;
		modal.mount();
	}

	public async renderOTPCodeModal(createOTPCode: () => Promise<OTPCode>, successCallback: (success: boolean, error?: Error) => void, updateOTPCode: (otpCode: OTPCode) => void) {
		this.modal?.unmount();
		await preload();
		this.successCallback = successCallback;

		const container = this.getMountedContainer();
		const otpCode = await createOTPCode();

		const modalProps: OTPCodeWidgetProps = {
			parentElement: container,
			sdkVersion: getVersion(),
			otpCode,
			onClose: () => {
				this.unload(true);
			},
			createOTPCode,
			updateOTPCode,
		};

		const modal = new this.options.OTPCodeModal(modalProps);
		this.modal = modal;
		modal.mount();
	}
}
