import Bowser from 'bowser';

export enum PlatformType {
	// React Native or Nodejs
	NonBrowser = 'nodejs',
	// MetaMask Mobile in-app browser
	MetaMaskMobileWebview = 'in-app-browser',
	// Desktop Browser
	DesktopWeb = 'web-desktop',
	// Mobile Browser
	MobileWeb = 'web-mobile',
	// ReactNative
	ReactNative = 'react-native',
}

function isNotBrowser() {
	if (typeof window === 'undefined') {
		return true;
	}
	if (!window?.navigator) {
		return true;
	}
	if (typeof global !== 'undefined' && global?.navigator?.product === 'ReactNative') {
		return true;
	}
	return navigator?.product === 'ReactNative';
}

function isReactNative() {
	const hasWindowNavigator = typeof window !== 'undefined' && window.navigator !== undefined;
	const navigator = hasWindowNavigator ? window.navigator : undefined;

	if (!navigator) {
		return false;
	}

	return hasWindowNavigator && window.navigator?.product === 'ReactNative';
}

function isMetaMaskMobileWebView() {
	return typeof window !== 'undefined' && Boolean(window.ReactNativeWebView) && Boolean(window.navigator.userAgent.endsWith('MetaMaskMobile'));
}

function isMobile() {
	const browser = Bowser.parse(window.navigator.userAgent);
	return browser?.platform?.type === 'mobile' || browser?.platform?.type === 'tablet';
}

/**
 *
 */
export function getPlatformType() {
	if (isReactNative()) {
		return PlatformType.ReactNative;
	}
	if (isNotBrowser()) {
		return PlatformType.NonBrowser;
	}
	if (isMetaMaskMobileWebView()) {
		return PlatformType.MetaMaskMobileWebview;
	}
	if (isMobile()) {
		return PlatformType.MobileWeb;
	}
	return PlatformType.DesktopWeb;
}


export function isSecure() {
	const platformType = getPlatformType();
	return isReactNative() || platformType === PlatformType.MobileWeb;
}

// Immediately start MetaMask detection when module loads
const detectionPromise: Promise<boolean> = (() => {
	const pt = getPlatformType();
	if (pt === PlatformType.NonBrowser || pt === PlatformType.ReactNative) {
		return Promise.resolve(false);
	}

	return new Promise((resolve) => {
		const providers: any[] = [];

		const handler = (event: any) => {
			if (event?.detail?.info?.rdns) {
				providers.push(event.detail);
			}
		};

		window.addEventListener('eip6963:announceProvider', handler);
		window.dispatchEvent(new Event('eip6963:requestProvider'));

		setTimeout(() => {
			window.removeEventListener('eip6963:announceProvider', handler);

			const hasMetaMask = providers.some(
				(p) => p?.info?.rdns === 'io.metamask',
			);

			resolve(hasMetaMask);
		}, 300); // default timeout 
	});
})();

export function hasExtension(): Promise<boolean> {
	return detectionPromise;
}
