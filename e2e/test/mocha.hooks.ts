import Utils from '../src/Utils';
import LockScreen from '../src/screens/MetaMask/LockScreen';
import { NATIVE_OS_APPS, WALLET_PASSWORD, SRP } from '../src/Constants';
import BottomNavigationComponent from '../src/screens/MetaMask/components/BottomNavigationComponent';
import SettingsScreen from '../src/screens/MetaMask/SettingsScreen';
import GetStartedScreen from '../src/screens/MetaMask/GetStartedScreen';
import WalletSetupScreen from '../src/screens/MetaMask/WalletSetupScreen';
import OptinMetricsScreen from '../src/screens/MetaMask/OptinMetricsScreen';
import TermsOfUseScreen from '../src/screens/MetaMask/TermsOfUseScreen';
import ImportFromSeedScreen from '../src/screens/MetaMask/ImportFromSeedScreen';
import Gestures from '../src/Gestures';
import SecurityUpdatesScreen from '../src/screens/MetaMask/SecurityUpdates';
import WelcomeComponent from '../src/screens/MetaMask/components/WelcomeComponent';
import WhatsNewComponent from '../src/screens/MetaMask/components/WhatsNewComponent';
import AndroidSettingsScreen from '../src/screens/Android/AndroidSettingsScreen';
import AndroidSettingsOpeningLinksScreen from '../src/screens/Android/AndroidSettingsOpeningLinksScreen';
import WalletReadyScreen from '../src/screens/MetaMask/WalletReadyScreen';
import EnableSmartTransactionsComponent from '../src/screens/MetaMask/components/EnableSmartTransactionsComponent';

const goToSettingsAndClearAllConnections = async () => {
  try {
    await BottomNavigationComponent.tapSettingsButton();
    await SettingsScreen.clearAllConnections();
    await BottomNavigationComponent.tapHomeButton();
  } catch (e) {
    console.log('No Connections to clear', e.message);
  }
};

export const beforeHook = async () => {
  // Fox animation takes a while to finish
  await driver.pause(5000);

  if (driver.isAndroid) {
    await Utils.killApp(NATIVE_OS_APPS.ANDROID.SETTINGS);
    await Utils.launchApp(NATIVE_OS_APPS.ANDROID.SETTINGS);
    await driver.setOrientation('PORTRAIT');

    await AndroidSettingsScreen.tapOpenSearchBarButton();
    await AndroidSettingsScreen.fillSearchBarInput('Opening links');
    await AndroidSettingsScreen.tapOpeningLinksSearchResult();

    await AndroidSettingsOpeningLinksScreen.scrollToMetaMaskAppOption();
    await AndroidSettingsOpeningLinksScreen.tapMetaMaskAppOption();

    await driver.pause(2000);

    const isAddLinksButtonDisplayed =
      await AndroidSettingsOpeningLinksScreen.addLinksButton.isDisplayed();

    if (isAddLinksButtonDisplayed) {
      const isAddLinksButtonEnabled =
        await AndroidSettingsOpeningLinksScreen.isAddLinksButtonEnabled();

      if (isAddLinksButtonEnabled) {
        await AndroidSettingsOpeningLinksScreen.tapAddLinksButton();
        await AndroidSettingsOpeningLinksScreen.selectAllMetaMaskSupportedLinks();
        await AndroidSettingsOpeningLinksScreen.tapAddMetaMaskSupportedLinks();
      }
    }
  }

  await Utils.launchMetaMask();

  // Checks it is onboarded. If it is and MM is locked, it unlocks it
  if (
    (await LockScreen.isMMLocked()) ||
    (await BottomNavigationComponent.isMetaMaskOnboarded())
  ) {
    await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
    await goToSettingsAndClearAllConnections();
    return;
  }
  await GetStartedScreen.tapGetStarted();
  await WalletSetupScreen.tapImportWithSRP();
  await OptinMetricsScreen.tapAgreeOptinMetrics();
  await TermsOfUseScreen.tapAcceptTermsOfUseCheckbox();
  await driver.pause(8000); // Waiting for the Terms of Use to be loaded
  await TermsOfUseScreen.tapScrollToBottom();
  await TermsOfUseScreen.tapAcceptTermsOfUseButton();
  await ImportFromSeedScreen.fillSrpField(SRP);
  await ImportFromSeedScreen.fillFirstPasswordInput(WALLET_PASSWORD);
  await ImportFromSeedScreen.fillSecondPasswordInput(WALLET_PASSWORD);
  await Gestures.hideKeyboardWithTap();
  await ImportFromSeedScreen.tapBiometricsToggleIfDisplayed();
  await ImportFromSeedScreen.tapImportButton();
  await driver.pause(5000);
  await WalletReadyScreen.tapDoneButton();
  await SecurityUpdatesScreen.tapNoThanksSecurityUpdates();
  await driver.pause(1000);
  await WelcomeComponent.tapNoThanksButton();
  await driver.pause(1000);
  await EnableSmartTransactionsComponent.tapDontEnableSmartTransactions();
  await driver.pause(1000);
  await WhatsNewComponent.closeModal();
};

export const beforeEachHook = async () => {
  await Utils.launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
};


// Skipping for now
export const afterEachHook = async () => {
  await Utils.launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
  await goToSettingsAndClearAllConnections();
};
