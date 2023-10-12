import { TFunction, i18n } from 'i18next';
import React, { CSSProperties, useState } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import CloseButton from './components/CloseButton';
import ConnectIcon from './components/ConnectIcon';
import Logo from './components/Logo';
import { MetamaskExtensionImage } from './components/MetamaskExtensionImage';
import TranslationWrapper from './providers/TranslationWrapper';
import styles from './styles';

export interface SelectModalProps {
  onClose: () => void;
  link: string;
  connectWithExtension: () => void;
  i18nInstance: i18n;
}

export const SelectModal = (props: SelectModalProps) => {
  const [tab, setTab] = useState<number>(1);

  const t = props.i18nInstance.t;

  return (
    <TranslationWrapper i18nInstance={props.i18nInstance}>
      <WidgetWrapper className="select-modal">
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
            <div style={styles.tabcontainer}>
              <div style={styles.flexContainer}>
                <div
                  onClick={() => setTab(1)}
                  style={
                    {
                      ...styles.tab,
                      ...(tab === 1 ? styles.tabactive : {}),
                      ...styles.flexItem,
                    } as CSSProperties
                  }
                >
                  {t('DESKTOP')}
                </div>
                <div
                  onClick={() => setTab(2)}
                  style={
                    {
                      ...styles.tab,
                      ...(tab === 2 ? styles.tabactive : {}),
                      ...styles.flexItem,
                    } as CSSProperties
                  }
                >
                  {t('MOBILE')}
                </div>
              </div>
            </div>
            <div style={{ display: tab === 1 ? 'none' : 'block' }}>
              <div style={styles.flexContainer}>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 4,
                    ...styles.flexItem,
                  }}
                >
                  <div id="sdk-qrcode-container" style={styles.center} />
                  <div style={styles.connectMobileText}>
                    {t('SCAN_TO_CONNECT')}
                    <br />
                    <span style={styles.blue}>
                      <b>{t('META_MASK_MOBILE_APP')}</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: tab === 2 ? 'none' : 'block' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: 300,
                  marginTop: -20,
                }}
              >
                <MetamaskExtensionImage />
              </div>
              <div style={styles.extensionLabel}>
                {t('SELECT_MODAL.CRYPTO_TAKE_CONTROL_TEXT')}
              </div>

              <button
                style={styles.button}
                onClick={props.connectWithExtension}
              >
                <ConnectIcon />
                <span style={styles.installExtensionText}>
                  {t('CONNECT_WITH_EXTENSION')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </WidgetWrapper>
    </TranslationWrapper>
  );
};
