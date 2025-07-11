declare module '@paulmillr/qr';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare const mmsdk: any;
declare global {
  interface Window {
    /**
     * TODO: Add types for the window object to manage connection with inApp browser, etc
     */
    ReactNativeWebView?: any;
  }
}
