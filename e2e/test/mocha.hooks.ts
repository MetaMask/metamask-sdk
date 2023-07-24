import Utils from '../src/Utils';
import LockScreen from '../src/screens/MetaMask/LockScreen';
import { WALLET_PASSWORD } from '../src/Constants';
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

const SRP =
  process.env.SRP ??
  'test test test test test test test test test test test test';

export const beforeHook = async () => {
  // Fox animation takes a while to finish
  await driver.pause(5000);
  await GetStartedScreen.tapGetStarted();
  await WalletSetupScreen.tapImportWithSRP();
  await OptinMetricsScreen.tapAgreeOptinMetrics();
  await TermsOfUseScreen.tapAcceptTermsOfUseCheckbox();
  await TermsOfUseScreen.tapScrollToBottom();
  await driver.pause(2000); // Waiting for the Terms of Use to be loaded
  await TermsOfUseScreen.tapAcceptTermsOfUseButton();
  await ImportFromSeedScreen.fillSrpField(SRP);
  await ImportFromSeedScreen.fillFirstPasswordInput(WALLET_PASSWORD);
  await ImportFromSeedScreen.fillSecondPasswordInput(WALLET_PASSWORD);
  await Gestures.hideKeyboardWithTap();
  await ImportFromSeedScreen.tapBiometricsToggleIfDisplayed();
  await ImportFromSeedScreen.tapImportButton();
  await SecurityUpdatesScreen.tapNoThanksSecurityUpdates();
  await WelcomeComponent.tapNoThanksButton();
  await WhatsNewComponent.closeModal();
};

export const beforeEachHook = async () => {
  await Utils.launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
};

export const afterEachHook = async () => {
  await Utils.launchMetaMask();
  await LockScreen.unlockMMifLocked(WALLET_PASSWORD);
  try {
    await BottomNavigationComponent.tapSettingsButton();
    await SettingsScreen.clearAllConnections();
    await BottomNavigationComponent.tapHomeButton();
  } catch (e) {
    console.log('No Connections to clear', e.message);
  }
};
