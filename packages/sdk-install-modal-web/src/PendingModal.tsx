import { i18n } from 'i18next';
import React from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import CloseButton from './components/CloseButton';
import Logo from './components/Logo';
import TranslationWrapper from './providers/TranslationWrapper';
import styles from './styles';
import SDKVersion from './components/SDKVersion';

export interface PendingModalProps {
  onClose: () => void;
  onDisconnect?: () => void;
  sdkVersion?: string;
  updateOTPValue: (otpValue: string) => void;
  displayOTP?: boolean;
  i18nInstance: i18n;
}

export const PendingModal = (props: PendingModalProps) => {
  const displayOTP = props.displayOTP ?? true;
  const { sdkVersion } = props;

  const t = props.i18nInstance.t;
  return (
    <TranslationWrapper i18nInstance={props.i18nInstance}>
      <WidgetWrapper className="pending-modal">
        <div style={styles.backdrop} onClick={props.onClose}></div>
        <div style={styles.modal}>
          <div style={styles.closeButtonContainer}>
            <div style={styles.right}>
              <span style={styles.closeButton} onClick={props.onClose}>
                <CloseButton />
              </span>
            </div>
          </div>
          <div style={styles.logoContainer}>
            <Logo />
          </div>
          <div>
            <div
              style={{
                ...styles.flexContainer,
                flexDirection: 'column',
                color: 'black',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '30px',
                  marginBottom: '30px',
                  ...styles.flexItem,
                  fontSize: 16,
                }}
              >
                {displayOTP
                  ? t('PENDING_MODAL.OPEN_META_MASK_SELECT_CODE')
                  : t('PENDING_MODAL.OPEN_META_MASK_CONTINUE')}
              </div>
              <div
                id="sdk-mm-otp-value"
                style={{ padding: 10, fontSize: 32, display: 'none' }}
              ></div>
              {displayOTP && (
                <div style={{ ...styles.notice }}>
                  * {t('PENDING_MODAL.NUMBER_AFTER_OPEN_NOTICE')}
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                style={{
                  ...styles.button,
                  ...styles.blue,
                  marginTop: '5px',
                  color: '#0376C9',
                  borderColor: '#0376C9',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  backgroundColor: 'white',
                }}
                onClick={props.onDisconnect}
              >
                {t('PENDING_MODAL.DISCONNECT')}
              </button>
            </div>
          </div>
          <SDKVersion version={sdkVersion} />
        </div>
      </WidgetWrapper>
    </TranslationWrapper>
  );
};
