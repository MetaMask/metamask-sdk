import { Component, Prop, h, Event, EventEmitter, State, Element } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import InstallIcon from '../misc/InstallIcon';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';

import QRCodeStyling, {
  DrawType,
  DotType,
  CornerSquareType,
  Options,
  ErrorCorrectionLevel,
  Mode,
  TypeNumber,
} from "qr-code-styling";

import { SimpleI18n } from '../misc/simple-i18n';
import SVG from '../../assets/fox.svg'

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
  private qrCodeContainer: HTMLDivElement | undefined;

  @Event() close: EventEmitter<{ shouldTerminate?: boolean }>;

  @Event() startDesktopOnboarding: EventEmitter;

  @Element() el: HTMLElement;

  @State() private translationsLoaded: boolean = false;

  constructor() {
    this.onClose = this.onClose.bind(this);
    this.onStartDesktopOnboardingHandler = this.onStartDesktopOnboardingHandler.bind(this);
    this.render = this.render.bind(this);

    this.i18nInstance = new SimpleI18n();
  }

  componentDidLoad() {
    this.generateQRCode();
  }

  async connectedCallback() {
    await this.i18nInstance.init({
      fallbackLng: 'en'
    });
    this.translationsLoaded = true;
  }

  private generateQRCode() {
    if (!this.qrCodeContainer || !this.link) {
      return;
    }

    const options: Options = {
      width: 165,
      height: 165,
      type: 'svg' as DrawType,
      data: this.link,
      image: SVG,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize:0.7,
        crossOrigin: 'anonymous',
        margin:5
      },
      dotsOptions: {
        color: '#222222',
        type: 'square' as DotType,
        gradient: undefined,
        roundSize: false,
      },
      cornersSquareOptions: {
        color: '#222222',
        type: 'square' as CornerSquareType,
        gradient: undefined
      },
      cornersDotOptions: {
        color: '#bf5208',
      },
      backgroundOptions: {
        color: 'transparent',
      },
      qrOptions: {
        typeNumber: 0 as TypeNumber,
        mode: 'Byte' as Mode,
        errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
      },
    };

    const qrCode = new QRCodeStyling(options);

    this.qrCodeContainer.innerHTML = '';

    // Append the QR code to the container
    qrCode.append(this.qrCodeContainer);
  }

  onClose(shouldTerminate = false) {
    this.close.emit({ shouldTerminate });
  }

  onStartDesktopOnboardingHandler() {
    this.startDesktopOnboarding.emit();
  }

  render() {
    if (!this.translationsLoaded) {
      return null; // or a loading state
    }

    const t = (key: string) => this.i18nInstance.t(key);

    // Determine which section should be shown first based on preferDesktop
    const showExtensionFirst = this.preferDesktop;

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
          <div class='modalHeader'>
            <h2 class='modalTitle'>{t('CONNECT_WITH_METAMASK')}</h2>
          </div>

          <div class='modalContent'>
            {!showExtensionFirst ? (
              // Extension first, then mobile
              <div>
                {/* Extension Section */}
                <div class='connectionSection'>
                  <h3 class='sectionTitle'>{t('USE_EXTENSION')}</h3>
                  <p class='sectionDescription'>{t('ONE_CLICK_CONNECT')}</p>

                  <button
                    class='button extensionButton'
                    onClick={() => this.onStartDesktopOnboardingHandler()}
                  >
                    <InstallIcon />
                    <span class='buttonText'>
                      {t('CONNECT_WITH_EXTENSION')}
                    </span>
                  </button>
                </div>

                <div class='sectionDivider'></div>

                {/* Mobile Section */}
                <div class='connectionSection'>
                  <h3 class='sectionTitle'>{t('USE_MOBILE')}</h3>
                  <p class='sectionDescription'>{t('SCAN_TO_CONNECT')}</p>

                  <div class='qrContainer'>
                    <div id="sdk-mm-qrcode" class='qrCode' ref={(el) => { if (el) this.qrCodeContainer = el; }} />
                  </div>
                </div>
              </div>
            ) : (
              // Mobile first, then extension
              <div>
                {/* Mobile Section */}
                <div class='connectionSection'>
                  <h3 class='sectionTitle'>{t('USE_MOBILE')}</h3>
                  <p class='sectionDescription'>{t('SCAN_TO_CONNECT')}</p>

                  <div class='qrContainer'>
                    <div id="sdk-mm-qrcode" class='qrCode' ref={(el) => { if (el) this.qrCodeContainer = el; }} />
                  </div>
                </div>

                <div class='sectionDivider'></div>

                {/* Extension Section */}
                <div class='connectionSection'>
                  <h3 class='sectionTitle'>{t('USE_EXTENSION')}</h3>
                  <p class='sectionDescription'>{t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION_TEXT')}</p>

                  <button
                    class='button extensionButton'
                    onClick={() => this.onStartDesktopOnboardingHandler()}
                  >
                    <InstallIcon />
                    <span class='buttonText'>
                      {t('INSTALL_MODAL.INSTALL_META_MASK_EXTENSION_BUTTON')}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <SDKVersion version={this.sdkVersion} />
        </div>
    </WidgetWrapper>
    )
  }
}

