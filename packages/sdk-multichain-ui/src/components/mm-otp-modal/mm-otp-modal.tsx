import { Component, Prop, h, Event, EventEmitter, State, Element } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';
import { SimpleI18n } from '../misc/simple-i18n';
import InstallIcon from '../misc/InstallIcon';

@Component({
  tag: 'mm-otp-modal',
  styleUrl: '../style.css',
  shadow: true,
})
export class OtpModal {
  /**
   * The QR code link
   */
  @Prop() displayOTP?: boolean;

  @Prop() sdkVersion?: string;

  private i18nInstance: SimpleI18n;

  @Prop() otpCode: string;

  @Event() close: EventEmitter;

  @Event() disconnect: EventEmitter;

  @Event() updateOTPCode: EventEmitter<{ otpCode: string }>;

  @Element() el: HTMLElement;

  @State() private translationsLoaded: boolean = false;

  constructor() {
    this.i18nInstance = new SimpleI18n();
  }

  async connectedCallback() {
    await this.i18nInstance.init({
      fallbackLng: 'en'
    });
    this.translationsLoaded = true;
  }

  onClose() {
    this.close.emit();
  }

  onDisconnect() {
    this.disconnect.emit();
  }

  onUpdateOTPValueHandler(otpCode: string) {
    this.updateOTPCode.emit({
      otpCode,
    })
  }

  disconnectedCallback() {
    this.onClose();
  }

  render() {
    if (!this.translationsLoaded) {
      return null;
    }

    const displayOTP = this.displayOTP ?? true;
    const sdkVersion = this.sdkVersion
    const t = (key: string) => this.i18nInstance.t(key);

    return (
        <WidgetWrapper className="pending-modal">
        <div class='backdrop' onClick={() => this.onClose()}></div>
        <div class='modal'>
          <div class='closeButtonContainer'>
            <div class='right'>
              <span class='closeButton' onClick={() => this.onClose()}>
                <CloseButton />
              </span>
            </div>
          </div>
          <div class='logoContainer'>
            <InstallIcon />
          </div>
          <div>
            <div
              class='flexContainer'
              style={{
                flexDirection: 'column',
                color: 'black',
              }}
            >
              <div
                class='flexItem'
                style={{
                  textAlign: 'center',
                  marginTop: '30px',
                  marginBottom: '30px',
                  fontSize: '16px',
                }}
              >
                {displayOTP
                  ? t('PENDING_MODAL.OPEN_META_MASK_SELECT_CODE')
                  : t('PENDING_MODAL.OPEN_META_MASK_CONTINUE')}
              </div>
              <div
                id="sdk-mm-otp-value"
                style={{ padding: '10px', fontSize: '32px', display: this.otpCode ? 'block' : 'none' }}
              >{this.otpCode}</div>
              {displayOTP && (
                <div class='notice'>
                  * {t('PENDING_MODAL.NUMBER_AFTER_OPEN_NOTICE')}
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                class='button blue'
                style={{
                  marginTop: '5px',
                  color: '#0376C9',
                  borderColor: '#0376C9',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  backgroundColor: 'white',
                }}
                onClick={() => this.onDisconnect()}
              >
                {t('PENDING_MODAL.DISCONNECT')}
              </button>
            </div>
          </div>
          <SDKVersion version={sdkVersion} />
        </div>
      </WidgetWrapper>
    )
  }
}
