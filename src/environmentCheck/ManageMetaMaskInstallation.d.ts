declare const ManageMetaMaskInstallation: {
    isInstalling: boolean;
    hasInstalled: boolean;
    resendRequest: any;
    preferDesktop: boolean;
    startDesktopOnboarding(): void;
    redirectToProperInstall(): Promise<unknown>;
    checkInstallation(): Promise<any>;
    start({ wait }: {
        wait?: boolean;
    }): Promise<any>;
};
export default ManageMetaMaskInstallation;
