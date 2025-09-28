import MetaMaskOnboarding from '@metamask/onboarding';
import { type ConnectionRequest, getPlatformType, getVersion, type Modal, type OTPCode, PlatformType } from '../domain';
import type { FactoryModals, ModalTypes } from './modals/types';
import type { AbstractOTPCodeModal } from './modals/base/AbstractOTPModal';
import { METAMASK_CONNECT_BASE_URL, METAMASK_DEEPLINK_BASE } from 'src/config';

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
	// biome-ignore lint/suspicious/noExplicitAny: Expected here
	public modal!: Modal<any>;
	private readonly platform: PlatformType = getPlatformType();
	private successCallback!: (error?: Error) => void;

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

	unload(error?: Error) {
		this.modal?.unmount();
		this.successCallback?.(error);
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

	createDeeplink(connectionRequest: ConnectionRequest) {
		const json = JSON.stringify(connectionRequest);
		const urlEncoded = encodeURIComponent(json);
		return `${METAMASK_DEEPLINK_BASE}/mwp?p=${urlEncoded}`;
	}

	createUniversalLink(connectionRequest: ConnectionRequest) {
		const json = JSON.stringify(connectionRequest);
		const urlEncoded = encodeURIComponent(json);
		return `${METAMASK_CONNECT_BASE_URL}/mwp?p=${urlEncoded}`;
	}

	private onCloseModal() {
		this.unload(new Error('User closed modal'));
	}

	private onStartDesktopOnboarding() {
		new MetaMaskOnboarding().startOnboarding();
	}

	public async renderInstallModal(preferDesktop: boolean, createConnectionRequest: () => Promise<ConnectionRequest>, successCallback: (error?: Error) => void) {
		this.modal?.unmount();
		await preload();
		this.successCallback = successCallback;

		const parentElement = this.getMountedContainer();
		const connectionRequest = await createConnectionRequest();
		const qrCodeLink = this.createDeeplink(connectionRequest);

		const modal = new this.options.InstallModal({
			expiresIn: (connectionRequest.sessionRequest.expiresAt - Date.now()) / 1000,
			connectionRequest,
			parentElement,
			preferDesktop,
			link: qrCodeLink,
			sdkVersion: getVersion(),
			generateQRCode: async (request) => this.createDeeplink(request),
			onClose: this.onCloseModal.bind(this),
			startDesktopOnboarding: this.onStartDesktopOnboarding.bind(this),
			createConnectionRequest,
		});

		this.modal = modal;
		modal.mount();
	}

	public async renderOTPCodeModal(
		createOTPCode: () => Promise<OTPCode>,
		successCallback: (error?: Error) => void,
		updateOTPCode: (otpCode: OTPCode, modal: AbstractOTPCodeModal) => void,
	) {
		this.modal?.unmount();
		await preload();
		this.successCallback = successCallback;

		const container = this.getMountedContainer();
		const otpCode = await createOTPCode();

		const modal = new this.options.OTPCodeModal({
			parentElement: container,
			sdkVersion: getVersion(),
			otpCode,
			onClose: this.onCloseModal.bind(this),
			createOTPCode,
			updateOTPCode: (otpCode: OTPCode) => updateOTPCode(otpCode, modal),
		});

		this.modal = modal;
		modal.mount();
	}
}
