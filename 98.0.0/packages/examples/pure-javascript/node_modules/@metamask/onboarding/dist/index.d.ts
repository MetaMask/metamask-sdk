export default class Onboarding {
    static FORWARDER_MODE: {
        INJECT: "INJECT";
        OPEN_TAB: "OPEN_TAB";
    };
    private readonly forwarderOrigin;
    private readonly downloadUrl;
    private readonly forwarderMode;
    private state;
    constructor({ forwarderOrigin, forwarderMode, }?: {
        forwarderOrigin?: string | undefined;
        forwarderMode?: "INJECT" | undefined;
    });
    _onMessage(event: MessageEvent): Promise<void> | undefined;
    _onMessageUnknownStateError(state: never): never;
    _onMessageFromForwarder(event: MessageEvent): Promise<void>;
    /**
     * Starts onboarding by opening the MetaMask download page and the Onboarding forwarder
     */
    startOnboarding(): void;
    /**
     * Stops onboarding registration, including removing the injected forwarder (if any)
     *
     * Typically this function is not necessary, but it can be useful for cases where
     * onboarding completes before the forwarder has registered.
     */
    stopOnboarding(): void;
    _openForwarder(): void;
    _openDownloadPage(): void;
    /**
     * Checks whether the MetaMask extension is installed
     */
    static isMetaMaskInstalled(): boolean;
    static _register(): any;
    static _injectForwarder(forwarderOrigin: string): void;
    static _removeForwarder(): void;
    static _detectBrowser(): "FIREFOX" | "CHROME" | null;
}
