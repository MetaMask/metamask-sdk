import { Component, Prop, h, Event, EventEmitter, State } from '@stencil/core';
import { WidgetWrapper } from '../widget-wrapper/widget-wrapper';
import SDKVersion from '../misc/SDKVersion';
import CloseButton from '../misc/CloseButton';
import Logo from '../misc/Logo';
import { i18n } from 'i18next';
import ConnectIcon from '../misc/ConnectIcon';
import { MetamaskExtensionImage } from '../misc/MetamaskExtensionImage';

@Component({
  tag: 'mm-select-modal',
  styleUrl: '../style.css',
  shadow: true,
})
export class PendingModal {
  /**
   * The QR code link
   */
  @Prop() link: string;

  @Prop() sdkVersion?: string;

  @Prop() i18nInstance: i18n;

  @Event() close: EventEmitter<{ shouldTerminate?: boolean }>;

  @Event() connectWithExtension: EventEmitter;

  @State() tab: number;

  onClose(shouldTerminate = false) {
    this.close.emit({ shouldTerminate });
  }

  connectWithExtensionHandler() {
    this.connectWithExtension.emit();
  }

  setTab(tab: number) {
    this.tab = tab;
  }

  disconnectedCallback() {
    this.onClose();
  }

  render() {
    const sdkVersion = this.sdkVersion
    const t = this.i18nInstance.t;

    return (
      <WidgetWrapper className="select-modal">
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
                  onClick={() => this.setTab(1)}
                  class={`tab flexItem${this.tab === 1 ? 'tabactive' : ''}`}
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => this.setTab(2)}
                  class={`tab flexItem${this.tab === 2 ? 'tabactive' : ''}`}
                >
                  {t('MOBILE')}
                </div>
              </div>
            </div>
            <div style={{ display: this.tab === 1 ? 'none' : 'block' }}>
              <div class='flexContainer'>
                <div
                  class='flexItem'
                  style={{
                    textAlign: 'center',
                    marginTop: '4',
                  }}
                >
                  <div class='center' id="sdk-qrcode-container" />
                  <div class='connectMobileText'>
                    {t('SCAN_TO_CONNECT')}
                    <br />
                    <span class='blue'>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: this.tab === 2 ? 'none' : 'block' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '300',
                  marginTop: '-20',
                }}
              >
                <MetamaskExtensionImage />
              </div>
              <div class='extensionLabel'>
                {t('SELECT_MODAL.CRYPTO_TAKE_CONTROL_TEXT')}
              </div>

              <button class='button' onClick={this.connectWithExtensionHandler}>
                <ConnectIcon />
                <span class='installExtensionText'>
                  {t('CONNECT_WITH_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
          <SDKVersion version={sdkVersion} />
        </div>
      </WidgetWrapper>
    )
  }
}
