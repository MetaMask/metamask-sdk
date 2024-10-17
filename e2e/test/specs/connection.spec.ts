import SafariBrowserScreen from "../../src/screens/iOS/SafariBrowserScreen";
import { Browsers, METAMASK_BUNDLE_ID, WALLET_PASSWORD } from "../../src/Constants";
import Utils, { deviceOpenDeeplinkWithMetaMask, goBack, navigateToWebMobileDapp } from "../../src/Utils";
import ChromeBrowserScreen from "../../src/screens/Android/ChromeBrowserScreen";
import DevnextJSDappScreen from "../../src/screens/Dapps/DevnextJSDappScreen";
import LockScreen from "../../src/screens/MetaMask/LockScreen";
import ConnectModalComponent from "../../src/screens/MetaMask/components/ConnectModalComponent";
import PersonalSignConfirmationComponent from "../../src/screens/MetaMask/components/PersonalSignConfirmationComponent";
import AndroidOpenWithComponent from "../../src/screens/Android/components/AndroidOpenWithComponent";


let devNextDappUrl: string;

describe('Devnext E2E', () => {
    before(async () => {
        devNextDappUrl = process.env.DEVNEXT_DAPP_URL ?? '';
        expect(devNextDappUrl).toBeDefined();
    });

    beforeEach(async () => {});

    it('should connect with a cold start state', async () => {
        await navigateToWebMobileDapp(devNextDappUrl, DevnextJSDappScreen);
        // Start with a cold start
        await Utils.killApp(METAMASK_BUNDLE_ID);

        await DevnextJSDappScreen.terminate();
        await DevnextJSDappScreen.connect();
        await deviceOpenDeeplinkWithMetaMask();

        await LockScreen.unlockMM(WALLET_PASSWORD);

        await ConnectModalComponent.tapConnectApproval();

        await goBack();

        expect(await DevnextJSDappScreen.isDappConnected()).toBe(true);
    });

    it.skip('should call personal_sign', async () => {
        // Start with a cold start
        await Utils.killApp(METAMASK_BUNDLE_ID);

        await navigateToWebMobileDapp(devNextDappUrl, DevnextJSDappScreen);

        await DevnextJSDappScreen.connect();
        await AndroidOpenWithComponent.tapOpenWithMetaMask();

        await LockScreen.unlockMMifLocked(WALLET_PASSWORD);

        await ConnectModalComponent.tapConnectApproval();

        await goBack();

        await DevnextJSDappScreen.tapPersonalSignButton();
        await AndroidOpenWithComponent.tapOpenWithMetaMask();
        expect(await PersonalSignConfirmationComponent.personalSignContainer.isDisplayed()).toBe(true);
        // the next expect is not working since MetaMask stopped using plaintext for personalSign
        // expect(await PersonalSignConfirmationComponent.messageText.getText()).toBe('Personal Sign');

        await PersonalSignConfirmationComponent.tapSignButton();

        await goBack();

        // expect the result of the personal sign request
    });

  });
