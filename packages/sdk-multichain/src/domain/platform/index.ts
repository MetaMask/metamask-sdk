import { PlatformType } from "@metamask/sdk-communication-layer";
import Bowser from "bowser";

export function isNotBrowser() {
	return (
		typeof window === "undefined" ||
		!window?.navigator ||
		(typeof global !== "undefined" &&
			global?.navigator?.product === "ReactNative") ||
		navigator?.product === "ReactNative"
	);
}

export function isBrowser() {
	return !isNotBrowser();
}

export function isReactNative() {
	return (
		isNotBrowser() &&
		typeof window !== "undefined" &&
		window?.navigator &&
		window.navigator?.product === "ReactNative"
	);
}

export function isMetaMaskMobileWebView() {
	if (typeof window === "undefined") {
		return false;
	}
	return (
		Boolean(window.ReactNativeWebView) &&
		Boolean(navigator.userAgent.endsWith("MetaMaskMobile"))
	);
}

export function isMobile() {
	const browser = Bowser.parse(window.navigator.userAgent);
	return (
		browser?.platform?.type === "mobile" || browser?.platform?.type === "tablet"
	);
}

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