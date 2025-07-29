import MetaMaskOnboarding from '@metamask/onboarding';
import { getPlatformType, getVersion, type InstallWidgetProps, ModalFactory, type OTPCodeWidgetProps, PlatformType, type RenderedModal } from '../domain';

let __instance: typeof import('@metamask/sdk-multichain-ui/dist/loader/index.js') | undefined;

/**
 * Preload install modal custom elements only once
 */
export async function preload() {
	__instance ??= await import('@metamask/sdk-multichain-ui/dist/loader/index.js')
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

	private unload() {
		if (this.modal) {
			this.modal.unmount();
		}
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

	public async renderInstallModal(link: string, preferDesktop: boolean) {
		await preload();
		const container = this.getMountedContainer();
		const modalProps: InstallWidgetProps = {
			onClose: this.unload.bind(this),
			metaMaskInstaller: {
				startDesktopOnboarding: () => {
					new MetaMaskOnboarding().startOnboarding();
					this.modal.unmount();
				},
			},
			parentElement: container,
			link,
			preferDesktop,
			sdkVersion: getVersion(),
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
