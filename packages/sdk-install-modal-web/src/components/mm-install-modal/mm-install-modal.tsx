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
import { TrackingEvents } from '../misc/tracking-events';

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

  @Event() close: EventEmitter<{ shouldTerminate?: boolean }>;

  @Event() startDesktopOnboarding: EventEmitter;

  @Event() trackAnalytics: EventEmitter<{ event: TrackingEvents, params?: Record<string, unknown> }>;

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

  componentDidLoad() {
    this.trackAnalytics.emit({
      event: TrackingEvents.SDK_MODAL_VIEWED,
      params: {
        extensionInstalled: false,
        tab: this.tab === 1 ? 'desktop' : 'mobile',
      },
    });
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

  onClose(shouldTerminate = false) {
    this.close.emit({ shouldTerminate });
  }

  onStartDesktopOnboardingHandler() {
    this.trackAnalytics.emit({
      event: TrackingEvents.SDK_MODAL_BUTTON_CLICKED,
      params: {
        button_type: 'install_extension',
        tab: 'desktop',
      },
    });
    this.startDesktopOnboarding.emit();
  }

  setTab(newTab: number, isUserAction: boolean = false) {
    if (isUserAction) {
      this.trackAnalytics.emit({
        event: TrackingEvents.SDK_MODAL_TOGGLE_CHANGED,
        params: {
          toggle: this.tab === 1 ? 'desktop_to_mobile' : 'mobile_to_desktop',
        },
      });
    }
    
    this.tab = newTab;
    this.isDefaultTab = false;
  }

  render() {
    if (!this.translationsLoaded) {
      return null; // or a loading state
    }

    const t = (key: string) => this.i18nInstance.t(key);
    const currentTab = this.isDefaultTab ? this.preferDesktop ? 1 : 2 : this.tab;

    const svgElement = encodeQR(this.link, "svg", {
      ecc: "medium",
      scale: 2
    });

    return (
      <WidgetWrapper className="install-model">
        <div class='backdrop' onClick={() => this.onClose(true)}></div>
        <div class='modal'>
          <div class='closeButtonContainer'>
            <div class='right'>
              <span class='closeButton' onClick={() => this.onClose(true)}>
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
                  onClick={() => this.setTab(1, true)}
                  class={`tab flexItem ${currentTab === 1 ? 'tabactive': ''}`}
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => this.setTab(2, true)}
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
                  {
                    svgElement && (
                      <div id="sdk-mm-qrcode" class='center' innerHTML={svgElement} />
                    )
                  }
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
                onClick={() => this.onStartDesktopOnboardingHandler()}
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
