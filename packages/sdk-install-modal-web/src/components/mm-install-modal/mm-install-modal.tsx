import { Component, Prop, h, Event, EventEmitter, State, Watch, Element } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import AdvantagesListItem from '../misc/AdvantagesListItem';
import WalletIcon from '../misc/WalletIcon';
import HeartIcon from '../misc/HeartIcon';
import LockIcon from '../misc/LockIcon';
import InstallIcon from '../misc/InstallIcon';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';
import Logo from '../misc/Logo';
import encodeQR from '@paulmillr/qr';
import { SimpleI18n } from '../misc/simple-i18n';
@Component({
  tag: 'mm-install-modal',
  styleUrl: '../style.css',
  shadow: true,
})
export class InstallModal {
  /**
   * The QR code link
   */
  @Prop() link: string;

  @Prop() sdkVersion?: string;

  @Prop() preferDesktop: boolean;

  private i18nInstance: SimpleI18n;

  @Event() close: EventEmitter;

  @Event() startDesktopOnboarding: EventEmitter;

  @State() tab: number = 1;

  @State() isDefaultTab: boolean = true;

  @Element() el: HTMLElement;

  @State() private translationsLoaded: boolean = false;

  constructor() {
    this.onClose = this.onClose.bind(this);
    this.onStartDesktopOnboardingHandler = this.onStartDesktopOnboardingHandler.bind(this);
    this.setTab = this.setTab.bind(this);
    this.render = this.render.bind(this);
    this.setTab(this.preferDesktop ? 1 : 2);

    this.i18nInstance = new SimpleI18n();
  }

  async connectedCallback() {
    await this.i18nInstance.init({
      fallbackLng: 'en'
    });
    this.translationsLoaded = true;
  }

  @Watch('preferDesktop')
  updatePreferDesktop(newValue: boolean) {
    if (newValue) {
      this.setTab(1);
    } else {
      this.setTab(2);
    }
  }

  @Watch('link')
  updateLink(newLink: string) {
    const svgElement = encodeQR(newLink, "svg", {
      ecc: "medium",
      scale: 2
    });

    if (!this.el.shadowRoot) {
      console.warn('Shadow root not found');
      return;
    }

    const qrcodeDiv = this.el.shadowRoot.querySelector("#sdk-mm-qrcode");

    if (!qrcodeDiv) {
      console.warn('QR code div not found');
      return;
    }

    qrcodeDiv.innerHTML = svgElement;
  }

  @Watch('translationsLoaded')
  onTranslationsLoaded(isLoaded: boolean) {
    if (isLoaded && this.tab === 2) {
      this.updateLink(this.link);
    }
  }

  @Watch('tab')
  onTabChange(newTab: number) {
    if (newTab === 2 && this.translationsLoaded) {
      this.updateLink(this.link);
    }
  }

  onClose() {
    this.close.emit();
  }

  onStartDesktopOnboardingHandler() {
    this.startDesktopOnboarding.emit();
  }

  setTab(newTab: number) {
    this.tab = newTab
    this.isDefaultTab = false;
  }

  componentDidLoad() {
    this.updateLink(this.link);
  }

  render() {
    if (!this.translationsLoaded) {
      return null; // or a loading state
    }

    const t = (key: string) => this.i18nInstance.t(key);

    const currentTab = this.isDefaultTab ? this.preferDesktop ? 1 : 2 : this.tab

    return (
      <WidgetWrapper className="install-model">
        <div class='backdrop' onClick={this.onClose}></div>
        <div class='modal'>
          <div class='closeButtonContainer'>
            <div class='right'>
              <span class='closeButton' onClick={this.onClose}>
                <CloseButton />
              </span>
            </div>
          </div>
          <div class='logoContainer'>
            <Logo />
          </div>
          <div>
            <div class='tabcontainer'>
              <div class='flexContainer'>
                <div
                  onClick={() => this.setTab(1)}
                  class={`tab flexItem ${currentTab === 1 ? 'tabactive': ''}`}
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => this.setTab(2)}
                  class={`tab flexItem ${currentTab === 2 ? 'tabactive': ''}`}
                >
                  {t('MOBILE')}
                </div>
              </div>
            </div>
            <div style={{ display: currentTab === 1 ? 'none' : 'block' }}>
              <div class='flexContainer'>
                <div
                  class='flexItem'
                  style={{
                    textAlign: 'center',
                    marginTop: '4',
                  }}
                >
                  <div id="sdk-mm-qrcode" class='center'>
                  </div>
                  <div class='connectMobileText'>
                    {t('SCAN_TO_CONNECT')} <br />
                    <span class='blue'>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: currentTab === 2 ? 'none' : 'block' }}>
              <div class='item'>
                <AdvantagesListItem
                  Icon={HeartIcon}
                  text={t('INSTALL_MODAL.TRUSTED_BY_USERS')}
                />
              </div>
              <div class='item'>
                <AdvantagesListItem
                  Icon={WalletIcon}
                  text={t('INSTALL_MODAL.LEADING_CRYPTO_WALLET')}
                />
              </div>
              <div class='item'>
                <AdvantagesListItem
                  Icon={LockIcon}
                  text={t('INSTALL_MODAL.CONTROL_DIGITAL_INTERACTIONS')}
                />
              </div>

              <button
                class='button'
                onClick={this.onStartDesktopOnboardingHandler}
              >
                <InstallIcon />
                <span class='installExtensionText'>
                  {t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
          <SDKVersion version={this.sdkVersion} />
        </div>
    </WidgetWrapper>
    )
  }
}
