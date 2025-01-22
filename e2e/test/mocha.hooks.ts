import { driver } from '@wdio/globals';
import { killApp, launchApp, launchMetaMask } from '@util/Utils';
import LockScreen from '@screens/MetaMask/LockScreen';
import { NATIVE_OS_APPS, WALLET_PASSWORD, SRP } from '@util/Constants';
import BottomNavigationComponent from '@screens/MetaMask/components/BottomNavigationComponent';
import SettingsScreen from '@screens/MetaMask/SettingsScreen';
import GetStartedScreen from '@screens/MetaMask/GetStartedScreen';
import WalletSetupScreen from '@screens/MetaMask/WalletSetupScreen';
import OptinMetricsScreen from '@screens/MetaMask/OptinMetricsScreen';
import TermsOfUseScreen from '@screens/MetaMask/TermsOfUseScreen';
import ImportFromSeedScreen from '@screens/MetaMask/ImportFromSeedScreen';
import Gestures from '@util/Gestures';
import SecurityUpdatesScreen from '@screens/MetaMask/SecurityUpdates';
import WelcomeComponent from '@screens/MetaMask/components/WelcomeComponent';
import MetaMetricsComponent from '@screens/MetaMask/components/MetaMetricsComponent';
import AndroidSettingsScreen from '@screens/Android/AndroidSettingsScreen';
import AndroidSettingsOpeningLinksScreen from '@screens/Android/AndroidSettingsOpeningLinksScreen';
import WalletReadyScreen from '@screens/MetaMask/WalletReadyScreen';
import EnableSmartTransactionsComponent from '@screens/MetaMask/components/EnableSmartTransactionsComponent';

const goToSettingsAndClearAllConnections = async () => {
  try {
    await BottomNavigationComponent.tapSettingsButton();
    await SettingsScreen.clearAllConnections();
    await BottomNavigationComponent.tapHomeButton();
  } catch (e) {
    console.log('No Connections to clear', e.message);
  }
};

const setAndroidDefaultLinks = async () => {
  await killApp(NATIVE_OS_APPS.ANDROID.SETTINGS);
  await launchApp(NATIVE_OS_APPS.ANDROID.SETTINGS);
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
};

export const beforeHook = async () => {
  if (driver.isAndroid) {
    await setAndroidDefaultLinks();
    await launchMetaMask();
  }

  await GetStartedScreen.tapGetStarted();
  await WalletSetupScreen.tapImportWithSRP();
  await OptinMetricsScreen.tapAgreeOptinMetrics();
  await TermsOfUseScreen.tapAcceptTermsOfUseCheckbox();
  await TermsOfUseScreen.tapScrollToBottom();
  await TermsOfUseScreen.tapAcceptTermsOfUseButton();
  await ImportFromSeedScreen.fillSrpField(SRP);
  await ImportFromSeedScreen.fillFirstPasswordInput(WALLET_PASSWORD);
  await ImportFromSeedScreen.fillSecondPasswordInput(WALLET_PASSWORD);
  await Gestures.hideKeyboardWithTap();
  await ImportFromSeedScreen.tapBiometricsToggleIfDisplayed();
  await ImportFromSeedScreen.tapImportButton();
  await WalletReadyScreen.tapDoneButton();

  // Waiting for the wallet to be ready. Because the initial loading popups
  // are very inconsistent we try to get them to show up before continuing
  await driver.pause(2000);
  await SecurityUpdatesScreen.tapNoThanksSecurityUpdates();
  await driver.pause(2000);
  await WelcomeComponent.tapNoThanksButton();
  await driver.pause(2000);
  await EnableSmartTransactionsComponent.tapEnableSmartTransactions();
  await driver.pause(1000);
  await MetaMetricsComponent.tapAgreeToMetaMetrics();
  // await WhatsNewComponent.closeModal();
};

export const onboardMM = async () => {
  await beforeHook();
};

export const beforeEachHook = async () => {
  await launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
};

// Skipping for now
export const afterEachHook = async () => {
  await launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
  await goToSettingsAndClearAllConnections();
};
