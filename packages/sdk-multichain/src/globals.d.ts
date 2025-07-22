declare module "@paulmillr/qr";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const mmsdk: any;
declare global {
	interface Window {
		/**
		 * TODO: Add types for the window object to manage connection with inApp browser, etc
		 */
		ReactNativeWebView?: any;
		mmsdk?: any;
		ethereum?: {
			isMetaMask?: boolean;
			request?: (request: { method: string; params?: any[] }) => Promise<any>;
			on?: (eventName: string, handler: (...args: any[]) => void) => void;
			removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
		};
	}
}
