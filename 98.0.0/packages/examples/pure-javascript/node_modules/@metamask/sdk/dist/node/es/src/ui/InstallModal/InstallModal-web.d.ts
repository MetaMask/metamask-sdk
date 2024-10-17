import { i18n } from 'i18next';
import { MetaMaskInstaller } from '../../Platform/MetaMaskInstaller';
declare const sdkWebInstallModal: ({ link, debug, installer, terminate, connectWithExtension, preferDesktop, i18nInstance, }: {
    link: string;
    debug?: boolean | undefined;
    preferDesktop?: boolean | undefined;
    installer: MetaMaskInstaller;
    terminate?: (() => void) | undefined;
    connectWithExtension?: (() => void) | undefined;
    i18nInstance: i18n;
}) => {
    mount: (qrcodeLink: string) => void;
    unmount: (shouldTerminate?: boolean) => void;
};
export default sdkWebInstallModal;
//# sourceMappingURL=InstallModal-web.d.ts.map